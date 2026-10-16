using WebApplication1.DTOs;

namespace WebApplication1.interfaces;

public interface IOrientacionReportRepository
{
    Task<IReadOnlyList<ReporteOrientacionResponse>> GetAsync(
        int psicosocialId,
        DateTimeOffset desde,
        DateTimeOffset hasta,
        CancellationToken cancellationToken);
}
