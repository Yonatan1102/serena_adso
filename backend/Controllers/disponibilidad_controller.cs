using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.Controllers;

[ApiController]
[Tags("Disponibilidad")]
[ApiExplorerSettings(GroupName = "Disponibilidad")]
[Route("api/disponibilidad")]
public class disponibilidad_Controller : ControllerBase
{
    private readonly Idisponibilidad repository;
    public disponibilidad_Controller(Idisponibilidad repository)=>this.repository=repository;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await repository.Getdisponibilidad());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await repository.GetdisponibilidadById(id);
        return item == null || !item.estado ? NotFound() : Ok(item);
    }

    [HttpGet("disponibles/{idUsuario:int}")]
    public async Task<IActionResult> GetDisponibles(int idUsuario) =>
        Ok(await repository.GetDisponibilidadDisponiblePorUsuario(idUsuario));

    [Authorize(Roles = "Psicosocial")]
    [HttpGet("mis-disponibilidades")]
    public async Task<IActionResult> GetMisDisponibilidades()
    {
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var idUsuario))
            return Unauthorized();
        return Ok(await repository.GetDisponibilidadPorUsuario(idUsuario));
    }

    [Authorize(Roles = "Psicosocial")]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] disponibilidad value)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (value == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var idUsuario))
            return Unauthorized();
        if (value.hora_inicio >= value.hora_fin)
            return BadRequest(new { mensaje = "La hora de inicio debe ser anterior a la hora de fin." });

        value.id_usuario = idUsuario;
        value.id_rol = 2;
        value.estado = true;
        try
        {
            var item = await repository.Postdisponibilidad(value);
            return CreatedAtAction(nameof(Get), new { id = item.id_disponibilidad }, item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    [Authorize(Roles = "Psicosocial")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] disponibilidad value)
    {
        if (id != value.id_disponibilidad) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var idUsuario))
            return Unauthorized();
        var existente = await repository.GetdisponibilidadById(id);
        if (existente is null) return NotFound();
        if (existente.id_usuario != idUsuario) return Forbid();
        value.id_usuario = idUsuario;
        value.id_rol = 2;

        var item = await repository.Putdisponibilidad(value);
        return item == null ? NotFound() : Ok(item);
    }

    [Authorize(Roles = "Psicosocial")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var idUsuario))
            return Unauthorized();
        var item = await repository.GetdisponibilidadById(id);
        if (item is null) return NotFound();
        if (item.id_usuario != idUsuario) return Forbid();
        return await repository.Deletedisponibilidad(id) ? NoContent() : NotFound();
    }
}
