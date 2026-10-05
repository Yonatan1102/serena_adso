using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class cita_repositories : Icita
{
    private readonly serena context;
    public cita_repositories(serena context) => this.context = context;
    public Task<List<cita>> Getcita() => context.cita.AsNoTracking().ToListAsync();
    public Task<cita?> GetcitaById(int id) => context.cita.FirstOrDefaultAsync(x => x.id_cita == id);
    public async Task<cita> Postcita(cita value)
    {
        if (value.estado_cita != "Pendiente" || !await TieneDisponibilidadAsync(value))
            throw new InvalidOperationException("La franja horaria seleccionada ya no está disponible.");

        context.cita.Add(value);
        await context.SaveChangesAsync();
        return value;
    }

    public async Task<cita?> Putcita(cita value)
    {
        await using var transaction = await context.Database.BeginTransactionAsync();
        var item = await context.cita.FirstOrDefaultAsync(x => x.id_cita == value.id_cita);
        if (item is null) return null;

        var estadoAnterior = item.estado_cita;
        if (estadoAnterior != value.estado_cita)
        {
            if ((value.estado_cita is "Cancelada" or "Rechazada") &&
                string.IsNullOrWhiteSpace(value.motivo_cambio))
                throw new InvalidOperationException("Debes indicar el motivo del rechazo o cancelación.");

            if (value.estado_cita == "Confirmada")
                await ConsumirDisponibilidadAsync(item);
            else if (estadoAnterior == "Confirmada" && (value.estado_cita is "Cancelada" or "Rechazada"))
                await LiberarDisponibilidadAsync(item);

            context.historial_cita.Add(new historial_cita
            {
                id_cita = item.id_cita,
                fecha_cambio = DateTime.UtcNow,
                estado_anterior = estadoAnterior,
                estado_nuevo = value.estado_cita,
                motivo_cambio = value.motivo_cambio,
                observaciones_historial = $"Cambio de estado de {estadoAnterior} a {value.estado_cita}."
            });
        }

        item.fecha_hora = value.fecha_hora;
        item.motivo = value.motivo;
        item.estado_cita = value.estado_cita;
        item.id_usuario_aprendiz = value.id_usuario_aprendiz;
        item.id_usuario_psicologo = value.id_usuario_psicologo;
        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        return item;
    }

    public async Task<bool> Deletecita(int id)
    {
        var item = await context.cita.FirstOrDefaultAsync(x => x.id_cita == id);
        if (item is null) return false;
        var updated = await Putcita(new cita
        {
            id_cita = item.id_cita,
            fecha_hora = item.fecha_hora,
            motivo = item.motivo,
            estado_cita = "Cancelada",
            id_usuario_aprendiz = item.id_usuario_aprendiz,
            id_usuario_psicologo = item.id_usuario_psicologo,
            motivo_cambio = "Cancelación solicitada por el usuario."
        });
        return updated is not null;
    }

    private async Task<bool> TieneDisponibilidadAsync(cita value)
    {
        var (dia, hora) = ObtenerDiaYHora(value.fecha_hora);
        return await context.disponibilidad.AnyAsync(slot =>
            slot.id_usuario == value.id_usuario_psicologo &&
            slot.dia_semana == dia &&
            slot.estado &&
            slot.hora_inicio <= hora &&
            slot.hora_fin > hora);
    }

    private async Task ConsumirDisponibilidadAsync(cita value)
    {
        var (dia, hora) = ObtenerDiaYHora(value.fecha_hora);
        var actualizadas = await context.disponibilidad
            .Where(slot => slot.id_usuario == value.id_usuario_psicologo &&
                slot.dia_semana == dia && slot.estado &&
                slot.hora_inicio <= hora && slot.hora_fin > hora)
            .ExecuteUpdateAsync(setters => setters.SetProperty(slot => slot.estado, false));

        if (actualizadas != 1)
            throw new InvalidOperationException("La franja horaria seleccionada ya fue reservada.");
    }

    private async Task LiberarDisponibilidadAsync(cita value)
    {
        var (dia, hora) = ObtenerDiaYHora(value.fecha_hora);
        var existeOtraOrientacionConfirmada = await context.cita.AnyAsync(other =>
            other.id_cita != value.id_cita &&
            other.id_usuario_psicologo == value.id_usuario_psicologo &&
            other.fecha_hora == value.fecha_hora &&
            other.estado_cita == "Confirmada");

        if (!existeOtraOrientacionConfirmada)
        {
            await context.disponibilidad
                .Where(slot => slot.id_usuario == value.id_usuario_psicologo &&
                    slot.dia_semana == dia && !slot.estado &&
                    slot.hora_inicio <= hora && slot.hora_fin > hora)
                .ExecuteUpdateAsync(setters => setters.SetProperty(slot => slot.estado, true));
        }
    }

    private static (byte dia, TimeSpan hora) ObtenerDiaYHora(DateTime fechaHora) =>
        ((byte)(((int)fechaHora.DayOfWeek + 6) % 7 + 1), fechaHora.TimeOfDay);
}
