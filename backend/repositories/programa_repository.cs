using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs;
using WebApplication1.interfaces;

namespace WebApplication1.repositories;

public sealed class programa_repository(serena context) : IProgramaRepository
{
    public async Task<IReadOnlyList<ProgramaResponse>> GetProgramasAsync(CancellationToken cancellationToken) =>
        await context.programa.AsNoTracking()
            .Where(item => item.fichas.Any(ficha => ficha.estado))
            .OrderBy(item => item.nombre_programa)
            .Select(item => new ProgramaResponse(item.id_programa, item.nombre_programa))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<FichaResponse>> GetFichasAsync(int programaId, CancellationToken cancellationToken) =>
        await context.ficha.AsNoTracking()
            .Where(item => item.id_programa == programaId && item.estado)
            .OrderBy(item => item.codigo_ficha)
            .Select(item => new FichaResponse(
                item.id_ficha,
                item.codigo_ficha,
                item.programa_navegacion!.nombre_programa,
                item.jornada ?? string.Empty))
            .ToListAsync(cancellationToken);

    public Task<bool> IsActiveFichaForProgramAsync(int fichaId, int programaId, CancellationToken cancellationToken) =>
        context.ficha.AnyAsync(
            item => item.id_ficha == fichaId && item.id_programa == programaId && item.estado,
            cancellationToken);
}
