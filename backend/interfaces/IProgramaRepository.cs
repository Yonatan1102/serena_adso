using WebApplication1.DTOs;

namespace WebApplication1.interfaces;

public interface IProgramaRepository
{
    Task<IReadOnlyList<ProgramaResponse>> GetProgramasAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<FichaResponse>> GetFichasAsync(int programaId, CancellationToken cancellationToken);
    Task<bool> IsActiveFichaForProgramAsync(int fichaId, int programaId, CancellationToken cancellationToken);
}
