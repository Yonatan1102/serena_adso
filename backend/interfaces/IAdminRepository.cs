using WebApplication1.DTOs;

namespace WebApplication1.interfaces;

public interface IAdminRepository
{
    Task<IReadOnlyList<AdminPsicosocialResponse>> GetPsicosocialesAsync(string? search, CancellationToken cancellationToken);
    Task<AdminPsicosocialDetailResponse?> GetPsicosocialDetailAsync(int id, CancellationToken cancellationToken);
    Task<AdminFichaResponse?> AssignFichaAsync(int psicosocialId, int fichaId, CancellationToken cancellationToken);
    Task<bool> UnassignFichaAsync(int psicosocialId, int fichaId, CancellationToken cancellationToken);
}
