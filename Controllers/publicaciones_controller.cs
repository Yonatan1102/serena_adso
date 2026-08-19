using Microsoft.AspNetCore.Mvc;
using WebApplication1.historial_clinico_repositories;
using WebApplication1.models;
using WebApplication1.repositories.interfaces;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class publicaciones_controller : ControllerBase
    {
        private readonly Ipublicaciones _publicacionesrepositories;

        public publicaciones_controller(Ipublicaciones publicacionesRepositories)
        {
            _publicacionesrepositories = publicacionesRepositories;
        }

        [HttpGet]
        public async Task<IActionResult> Listar_publicaciones()
        {
            try
            {
                var responsive = await _publicacionesrepositories.Getpublicaciones();
                return Ok(responsive);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener las publicaciones.", detalle = ex.Message });
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

                return Ok(responsive);
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

        [HttpPost]
        public async Task<IActionResult> crear_publicaicon([FromBody] publicaciones publicaciones)
        {
            try
            {

                if (publicaciones == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(publicaciones.titulo))
                {
                    return BadRequest(new { mensaje = "El título de la publicación es obligatorio." });
                }

                var response = await _publicacionesrepositories.Postpublicaciones(publicaciones);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }
        [HttpPost]
        public async Task<IActionResult> crear_publicacion([FromBody] publicaciones publicaciones)
        {
            try
            {

                if (publicaciones == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(publicaciones.titulo))
                {
                    return BadRequest(new { mensaje = "El título de la publicación es obligatorio." });
                }

                var response = await _publicacionesrepositories.Postpublicaciones(publicaciones);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> actualizacion_publicacion([FromBody] publicaciones publicaciones)
        {
            try
            {
                if (publicaciones == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                var response = await _publicacionesrepositories.Putpublicaciones(publicaciones);

                if (response == null)
                {
                    return NotFound(new { mensaje = "No se pudo actualizar porque la publicación no existe." });
                }

                return Ok(response);
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
    }

