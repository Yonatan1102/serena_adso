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
    public async Task<IActionResult> Get() => Ok((await repository.Getdisponibilidad()).Select(ToResponse));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await repository.GetdisponibilidadById(id);
        return item == null || !item.estado ? NotFound() : Ok(ToResponse(item));
    }

    [HttpGet("disponibles/{idUsuario:int}")]
    public async Task<IActionResult> GetDisponibles(int idUsuario) =>
        Ok((await repository.GetDisponibilidadDisponiblePorUsuario(idUsuario)).Select(ToResponse));

    [Authorize(Roles = "Psicosocial")]
    [HttpGet("mis-disponibilidades")]
    public async Task<IActionResult> GetMisDisponibilidades()
    {
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var idUsuario))
            return Unauthorized();
        return Ok((await repository.GetDisponibilidadPorUsuario(idUsuario)).Select(ToResponse));
    }

    [Authorize(Roles = "Psicosocial")]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] DisponibilidadRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var idUsuario))
            return Unauthorized();
        if (request.fecha < DateOnly.FromDateTime(DateTime.Today))
            return BadRequest(new { mensaje = "La fecha de disponibilidad no puede estar en el pasado." });
        if (request.hora_inicio >= request.hora_fin)
            return BadRequest(new { mensaje = "La hora de inicio debe ser anterior a la hora de fin." });

        var value = new disponibilidad
        {
            id_usuario = idUsuario,
            id_rol = 2,
            fecha = request.fecha,
            hora_inicio = request.hora_inicio,
            hora_fin = request.hora_fin,
            estado = true
        };
        try
        {
            var item = await repository.Postdisponibilidad(value);
            return CreatedAtAction(nameof(Get), new { id = item.id_disponibilidad }, ToResponse(item));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    [Authorize(Roles = "Psicosocial")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] DisponibilidadRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!int.TryParse(User.FindFirstValue("id_usuario"), out var idUsuario))
            return Unauthorized();
        if (request.fecha < DateOnly.FromDateTime(DateTime.Today))
            return BadRequest(new { mensaje = "La fecha de disponibilidad no puede estar en el pasado." });
        if (request.hora_inicio >= request.hora_fin)
            return BadRequest(new { mensaje = "La hora de inicio debe ser anterior a la hora de fin." });
        var existente = await repository.GetdisponibilidadById(id);
        if (existente is null) return NotFound();
        if (existente.id_usuario != idUsuario) return Forbid();
        var value = new disponibilidad
        {
            id_disponibilidad = id,
            id_usuario = idUsuario,
            id_rol = 2,
            fecha = request.fecha,
            hora_inicio = request.hora_inicio,
            hora_fin = request.hora_fin,
            estado = request.estado
        };

        var item = await repository.Putdisponibilidad(value);
        return item == null ? NotFound() : Ok(ToResponse(item));
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

    private static DisponibilidadResponse ToResponse(disponibilidad value) => new(
        value.id_disponibilidad,
        value.id_usuario,
        value.id_rol,
        value.fecha,
        value.hora_inicio,
        value.hora_fin,
        value.estado);
}

public sealed record DisponibilidadRequest(
    DateOnly fecha,
    TimeSpan hora_inicio,
    TimeSpan hora_fin,
    bool estado = true);

public sealed record DisponibilidadResponse(
    int id_disponibilidad,
    int id_usuario,
    int id_rol,
    DateOnly fecha,
    TimeSpan hora_inicio,
    TimeSpan hora_fin,
    bool estado);
