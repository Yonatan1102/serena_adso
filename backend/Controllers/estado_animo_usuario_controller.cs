using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/estado-animo-Usuario")]
public class EstadoAnimoUsuarioController : ControllerBase
{
    private readonly IEstadoAnimoUsuario _repository;

    public EstadoAnimoUsuarioController(IEstadoAnimoUsuario repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var response = await _repository.Getestado_animo_usuario();
            return Ok(response.Select(ToResponse));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "No se pudo listar los registros de estado de ánimo.", detalle = ex.Message });
        }
    }

    [HttpGet("Usuario/{idUsuario:int}")]
    public async Task<IActionResult> GetByUsuario(int idUsuario)
    {
        try
        {
            var response = await _repository.Getestado_animo_usuarioPorUsuario(idUsuario);
            return Ok(response.Select(ToResponse));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "No se pudo consultar el historial del Usuario.", detalle = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var response = await _repository.Getestado_animo_usuarioById(id);
            return response == null ? NotFound() : Ok(ToResponse(response));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "No se pudo consultar el registro de estado de ánimo.", detalle = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EstadoAnimoUsuario value)
    {
        try
        {
            if (value == null)
                return BadRequest(new { mensaje = "El cuerpo de la solicitud es obligatorio." });

            if (value.id_usuario <= 0)
                return BadRequest(new { mensaje = "El Usuario es obligatorio." });

            if (value.id_estado <= 0)
                return BadRequest(new { mensaje = "El estado de ánimo es obligatorio." });

            if (string.IsNullOrWhiteSpace(value.motivo))
                return BadRequest(new { mensaje = "El motivo del registro es obligatorio." });

            var response = await _repository.Postestado_animo_usuario(value);
            return Ok(ToResponse(response));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "No se pudo registrar el estado de ánimo.", detalle = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EstadoAnimoUsuario value)
    {
        try
        {
            if (value == null)
                return BadRequest(new { mensaje = "El cuerpo de la solicitud es obligatorio." });

            if (id != value.id_estado_usuario)
                return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });

            var response = await _repository.Putestado_animo_usuario(value);
            return response == null ? NotFound() : Ok(ToResponse(response));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "No se pudo actualizar el registro de estado de ánimo.", detalle = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var response = await _repository.Deleteestado_animo_usuario(id);
            return response ? NoContent() : NotFound();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "No se pudo eliminar el registro de estado de ánimo.", detalle = ex.Message });
        }
    }

    private static EstadoAnimoUsuarioResponse ToResponse(EstadoAnimoUsuario value) =>
        new(
            value.id_estado_usuario,
            value.id_estado,
            value.id_usuario,
            value.fecha_estado,
            value.motivo,
            value.EstadoDeAnimo?.nombre_estado
        );
}

public sealed record EstadoAnimoUsuarioResponse(
    int id_estado_usuario,
    int id_estado,
    int id_usuario,
    DateTime fecha_estado,
    string motivo,
    string? nombre_estado
);
