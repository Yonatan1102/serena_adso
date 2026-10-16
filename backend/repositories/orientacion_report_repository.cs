using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs;
using WebApplication1.interfaces;

namespace WebApplication1.repositories;

public sealed class orientacion_report_repository(serena context) : IOrientacionReportRepository
{
    public async Task<IReadOnlyList<ReporteOrientacionResponse>> GetAsync(
        int psicosocialId,
        DateTimeOffset desde,
        DateTimeOffset hasta,
        CancellationToken cancellationToken)
    {
        var startUtc = desde.UtcDateTime;
        var endUtc = hasta.UtcDateTime;
        var items = await context.cita
            .AsNoTracking()
            .Where(item => item.id_usuario_psicologo == psicosocialId &&
                item.fecha_hora >= startUtc && item.fecha_hora < endUtc)
            .OrderBy(item => item.fecha_hora)
            .Select(item => new
            {
                item.id_cita,
                item.fecha_hora,
                item.motivo,
                item.estado_cita,
                item.id_usuario_aprendiz,
                Aprendiz = item.id_usuario_aprendiz_navegacion!.nombre_usuario,
                MotivoCambio = item.historial_citas
                    .Where(history => history.estado_nuevo == "Cancelada" || history.estado_nuevo == "Rechazada")
                    .OrderByDescending(history => history.fecha_cambio)
                    .Select(history => history.motivo_cambio)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return items.Select(item => new ReporteOrientacionResponse(
            item.id_cita,
            new DateTimeOffset(DateTime.SpecifyKind(item.fecha_hora, DateTimeKind.Utc)),
            item.motivo ?? string.Empty,
            item.estado_cita,
            item.id_usuario_aprendiz,
            item.Aprendiz,
            item.MotivoCambio)).ToArray();
    }
}
