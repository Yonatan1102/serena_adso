using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs;
using WebApplication1.interfaces;

namespace WebApplication1.repositories;

public sealed class admin_repository(serena context) : IAdminRepository
{
    public async Task<IReadOnlyList<AdminPsicosocialResponse>> GetPsicosocialesAsync(
        string? search,
        CancellationToken cancellationToken)
    {
        var professionals = context.usuario
            .AsNoTracking()
            .Where(user => user.rol != null && EF.Functions.Like(user.rol.nombre_rol, "%psic%"));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            professionals = professionals.Where(user =>
                EF.Functions.Like(user.nombre_usuario, term) ||
                EF.Functions.Like(user.email, term) ||
                (user.documento != null && EF.Functions.Like(user.documento, term)));
        }

        var users = await professionals
            .OrderBy(user => user.nombre_usuario)
            .Select(user => new { user.id_usuario, user.nombre_usuario, user.email, user.documento })
            .ToListAsync(cancellationToken);

        var ids = users.Select(user => user.id_usuario).ToArray();
        var appointments = await context.cita
            .AsNoTracking()
            .Where(item => ids.Contains(item.id_usuario_psicologo))
            .Select(item => new { item.id_usuario_psicologo, item.id_usuario_aprendiz, item.estado_cita })
            .ToListAsync(cancellationToken);

        var counts = appointments
            .GroupBy(item => item.id_usuario_psicologo)
            .ToDictionary(
                group => group.Key,
                group => new
                {
                    Learners = group.Select(item => item.id_usuario_aprendiz).Distinct().Count(),
                    Completed = group.Count(item => item.estado_cita == "Realizada")
                });

        return users.Select(user =>
        {
            counts.TryGetValue(user.id_usuario, out var count);
            return new AdminPsicosocialResponse(
                user.id_usuario,
                user.nombre_usuario,
                user.email,
                user.documento,
                count?.Learners ?? 0,
                count?.Completed ?? 0);
        }).ToArray();
    }

    public async Task<AdminPsicosocialDetailResponse?> GetPsicosocialDetailAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var professional = await context.usuario
            .AsNoTracking()
            .Where(user => user.id_usuario == id &&
                user.rol != null && EF.Functions.Like(user.rol.nombre_rol, "%psic%"))
            .Select(user => new { user.id_usuario, user.nombre_usuario, user.email, user.documento })
            .FirstOrDefaultAsync(cancellationToken);

        if (professional is null)
            return null;

        var appointments = await context.cita
            .AsNoTracking()
            .Include(item => item.id_usuario_aprendiz_navegacion)
            .Include(item => item.historial_citas)
            .Where(item => item.id_usuario_psicologo == id)
            .OrderByDescending(item => item.fecha_hora)
            .ToListAsync(cancellationToken);

        var learners = appointments
            .GroupBy(item => new
            {
                item.id_usuario_aprendiz,
                item.id_usuario_aprendiz_navegacion!.nombre_usuario,
                item.id_usuario_aprendiz_navegacion.email,
                item.id_usuario_aprendiz_navegacion.num_ficha
            })
            .Select(group => new AdminAprendizResponse(
                group.Key.id_usuario_aprendiz,
                group.Key.nombre_usuario,
                group.Key.email,
                group.Key.num_ficha,
                ToUtcOffset(group.Min(item => item.fecha_hora)),
                ToUtcOffset(group.Max(item => item.fecha_hora))))
            .OrderBy(item => item.nombre)
            .ToArray();

        var orientationHistory = appointments.Select(item =>
        {
            var reason = item.historial_citas
                .Where(history => history.estado_nuevo is "Cancelada" or "Rechazada")
                .OrderByDescending(history => history.fecha_cambio)
                .Select(history => history.motivo_cambio)
                .FirstOrDefault();

            return new AdminOrientacionResponse(
                item.id_cita,
                ToUtcOffset(item.fecha_hora),
                item.motivo ?? string.Empty,
                item.estado_cita,
                item.id_usuario_aprendiz_navegacion?.nombre_usuario ?? "Aprendiz",
                reason);
        }).ToArray();

        var publications = await context.publicaciones
            .AsNoTracking()
            .Where(item => item.id_usuario == id)
            .OrderByDescending(item => item.fecha_publicacion)
            .Select(item => new AdminPublicacionResponse(
                item.id_publicaciones,
                item.titulo,
                ToUtcOffset(item.fecha_publicacion)))
            .ToListAsync(cancellationToken);

        return new AdminPsicosocialDetailResponse(
            professional.id_usuario,
            professional.nombre_usuario,
            professional.email,
            professional.documento,
            learners.Length,
            appointments.Count(item => item.estado_cita == "Realizada"),
            appointments.Count(item => item.estado_cita == "Rechazada"),
            appointments.Count(item => item.estado_cita == "Cancelada"),
            appointments.Count(item => item.estado_cita == "Pendiente"),
            orientationHistory,
            learners,
            publications);
    }

    private static DateTimeOffset ToUtcOffset(DateTime value) =>
        new(DateTime.SpecifyKind(value, DateTimeKind.Utc));
}
