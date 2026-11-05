using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    [Route("api/Publicaciones")]
    [ApiController]
    public class PublicacionesController : ControllerBase
    {
        private readonly IPublicaciones _publicacionesrepositories;

        public PublicacionesController(IPublicaciones publicacionesRepositories)
        {
            _publicacionesrepositories = publicacionesRepositories;
        }

        [HttpGet]
        public async Task<IActionResult> Listar_publicaciones()
        {
            try
            {
                var responsive = await _publicacionesrepositories.Getpublicaciones();
                return Ok(responsive.Select(ToResponse));
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener las Publicaciones.", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Publicaciones(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { mensaje = "El ID proporcionado no es válido." });
                }

                var responsive = await _publicacionesrepositories.GetpublicacionesById(id);

                if (responsive == null)
                {
                    return NotFound(new { mensaje = $"No se encontró la publicación con el ID {id}." });
                }

                return Ok(ToResponse(responsive));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error interno al buscar la publicación.",
                    detalle = ex.Message
                });
            }
        }

        [HttpPost("crear")]
        public async Task<IActionResult> crear_publicaicon([FromBody] Publicaciones Publicaciones)
        {
            try
            {

                if (Publicaciones == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(Publicaciones.titulo))
                {
                    return BadRequest(new { mensaje = "El título de la publicación es obligatorio." });
                }

                var response = await _publicacionesrepositories.Postpublicaciones(Publicaciones);
                return CreatedAtAction(nameof(Publicaciones), new { id = response.id_publicaciones }, ToResponse(response));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }
        [HttpPost("registrar")]
        public async Task<IActionResult> crear_publicacion([FromBody] Publicaciones Publicaciones)
        {
            try
            {

                if (Publicaciones == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(Publicaciones.titulo))
                {
                    return BadRequest(new { mensaje = "El título de la publicación es obligatorio." });
                }

                var response = await _publicacionesrepositories.Postpublicaciones(Publicaciones);
                return Ok(ToResponse(response));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> actualizacion_publicacion([FromBody] Publicaciones Publicaciones)
        {
            try
            {
                if (Publicaciones == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                var response = await _publicacionesrepositories.Putpublicaciones(Publicaciones);

                if (response == null)
                {
                    return NotFound(new { mensaje = "No se pudo actualizar porque la publicación no existe." });
                }

                return Ok(ToResponse(response));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error interno al actualizar la publicación.",
                    detalle = ex.Message
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            return await _publicacionesrepositories.Deletepublicaciones(id) ? NoContent() : NotFound();
        }

        private static PublicacionResponse ToResponse(Publicaciones value) =>
            new(
                value.id_publicaciones,
                value.titulo,
                value.contenido,
                value.fecha_publicacion,
                value.id_usuario,
                value.id_comunidad,
                value.etiqueta,
                value.votos,
                value.comentarios_count,
                value.imagen_url is { Length: <= 2_800_000 } ? value.imagen_url : null
            );
    }

    public sealed record PublicacionResponse(
        int id_publicaciones,
        string titulo,
        string? contenido,
        DateTime fecha_publicacion,
        int id_usuario,
        string? id_comunidad,
        string? etiqueta,
        int votos,
        int comentarios_count,
        string? imagen_url
    );
}
