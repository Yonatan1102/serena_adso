using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using WebApplication1.DTOs;
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

    [HttpPost("psicosociales/{id:int}/fichas")]
    public async Task<IActionResult> AssignFicha(
        int id,
        [FromBody] AdminAssignFichaRequest request,
        CancellationToken cancellationToken)
    {
        var assignment = await repository.AssignFichaAsync(id, request.id_ficha, cancellationToken);
        return assignment is null ? NotFound() : Ok(assignment);
    }

    [HttpDelete("psicosociales/{id:int}/fichas/{fichaId:int}")]
    public async Task<IActionResult> UnassignFicha(int id, int fichaId, CancellationToken cancellationToken) =>
        await repository.UnassignFichaAsync(id, fichaId, cancellationToken) ? NoContent() : NotFound();
}

public sealed record AdminAssignFichaRequest([Required, Range(1, int.MaxValue)] int id_ficha);
