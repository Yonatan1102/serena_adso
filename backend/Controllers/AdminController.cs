using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;

namespace WebApplication1.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public sealed class AdminController(IAdminRepository repository) : ControllerBase
{
    [HttpGet("psicosociales")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPsicosociales(
        [FromQuery] string? search,
        CancellationToken cancellationToken) =>
        Ok(await repository.GetPsicosocialesAsync(search, cancellationToken));

    [HttpGet("psicosociales/{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPsicosocial(int id, CancellationToken cancellationToken)
    {
        var result = await repository.GetPsicosocialDetailAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
