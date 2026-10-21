using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;

namespace WebApplication1.Controllers;

[ApiController]
[Authorize(Roles = "Psicosocial")]
[Route("api/psicosocial/reportes")]
public sealed class PsicosocialReportController(IOrientacionReportRepository repository) : ControllerBase
{
    [HttpGet("orientaciones")]
    public async Task<IActionResult> GetOrientaciones(
        [FromQuery] DateTimeOffset desde,
        [FromQuery] DateTimeOffset hasta,
        CancellationToken cancellationToken)
    {
        if (desde >= hasta || hasta - desde > TimeSpan.FromDays(185))
            return BadRequest(new { mensaje = "El rango debe ser válido y no puede superar seis meses." });
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var psicosocialId))
            return Unauthorized();

        return Ok(await repository.GetAsync(psicosocialId, desde, hasta, cancellationToken));
    }
}
