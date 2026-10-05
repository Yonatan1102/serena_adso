using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;

namespace WebApplication1.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/programas")]
public sealed class ProgramaController(IProgramaRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProgramas(CancellationToken cancellationToken) =>
        Ok(await repository.GetProgramasAsync(cancellationToken));

    [HttpGet("{id:int}/fichas")]
    public async Task<IActionResult> GetFichas(int id, CancellationToken cancellationToken) =>
        Ok(await repository.GetFichasAsync(id, cancellationToken));
}
