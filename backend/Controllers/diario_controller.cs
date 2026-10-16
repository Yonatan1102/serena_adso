using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Authorize]
[Route("api/diario")]
public sealed class diario_controller(Idiario diarioRepository) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> ListarDiarios() =>
        Ok((await diarioRepository.Getdiario()).Where(item => item.compartir_sp).Select(ToResponse));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerDiario(int id)
    {
        var entry = await diarioRepository.GetdiarioById(id);
        if (entry is null) return NotFound();
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var callerId)) return Unauthorized();
        if (entry.id_usuario != callerId &&
            (!(User.IsInRole("Psicosocial") || User.IsInRole("Admin")) || !entry.compartir_sp))
            return Forbid();
        return Ok(ToResponse(entry));
    }

    [HttpGet("usuario/{id_usuario:int}")]
    public async Task<IActionResult> ObtenerDiarioPorUsuario(int id_usuario)
    {
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var callerId)) return Unauthorized();
        var esPropietario = callerId == id_usuario;
        if (!esPropietario && !User.IsInRole("Psicosocial") && !User.IsInRole("Admin")) return Forbid();

        var entries = await diarioRepository.GetdiariosByUsuario(id_usuario);
        if (!esPropietario) entries = entries.Where(item => item.compartir_sp).ToList();
        return Ok(entries.Select(ToResponse));
    }

    [Authorize(Roles = "Aprendiz")]
    [HttpPost("crear")]
    public async Task<IActionResult> CrearActualizacion([FromBody] DiarioUpdateRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (string.IsNullOrWhiteSpace(request.contenido))
            return BadRequest(new { mensaje = "El contenido del diario es obligatorio." });
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var userId)) return Unauthorized();

        var entry = new diario
        {
            id_usuario = userId,
            fecha_apertura = DateTime.UtcNow,
            compartir_sp = request.compartir_sp,
            contenido = request.contenido.Trim()
        };
        var created = await diarioRepository.UpsertDiario(entry);
        return CreatedAtAction(nameof(ObtenerDiario), new { id = created.id_diario }, ToResponse(created));
    }

    [Authorize(Roles = "Aprendiz")]
    [HttpPost("registrar")]
    public Task<IActionResult> RegistrarActualizacion([FromBody] DiarioUpdateRequest request) => CrearActualizacion(request);

    [Authorize(Roles = "Aprendiz")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> ActualizarDiario(int id, [FromBody] diario update)
    {
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var userId)) return Unauthorized();
        var existing = await diarioRepository.GetdiarioById(id);
        if (existing is null) return NotFound();
        if (existing.id_usuario != userId) return Forbid();
        update.id_diario = id;
        update.id_usuario = userId;
        var result = await diarioRepository.Putdiario(update);
        return result is null ? NotFound() : Ok(ToResponse(result));
    }

    [Authorize(Roles = "Aprendiz")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> EliminarDiario(int id)
    {
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var userId)) return Unauthorized();
        var entry = await diarioRepository.GetdiarioById(id);
        if (entry is null) return NotFound();
        if (entry.id_usuario != userId) return Forbid();
        return await diarioRepository.Deletediario(id) ? NoContent() : NotFound();
    }

    private static DiarioResponse ToResponse(diario item) => new(
        item.id_diario,
        item.id_usuario,
        item.fecha_apertura,
        item.compartir_sp,
        item.contenido);
}

public sealed record DiarioUpdateRequest([Required, StringLength(4000)] string contenido, bool compartir_sp);

public sealed record DiarioResponse(
    int id_diario,
    int id_usuario,
    DateTime fecha_apertura,
    bool compartir_sp,
    string contenido);
