using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.repositories;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;
    using WebApplication1.repositories;

    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly Iusuario usuario;

        public usuario_controller(Iusuario usuario_repositories)
        {
        
        }
        [HttpGet]
        public async Task<IActionResult> Listarusuario()
        {
            try
            {
                var response = await usuario_repositories.Getusuario();
                return Ok(response);
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener los historiales clínicos.", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Obtenerusuario(int id)
        {
            try
            {
                var response = await usuario_repositories.GetusuarioById(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el historial clínico.", detalle = ex.Message });
            }

        }
        [HttpPost]
        public async Task<IActionResult> crear_usuario([FromBody] usuario usuario)
        {
            try
            {

                if (usuario == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (usuario.id_usuario == 0)
                {
                    return BadRequest(new { mensaje = "El usuario del historial clínico es obligatorio." });
                }

                var response = await historial_clinico_repositories.Postusuario(usuario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear el historial clínico.", detalle = ex.Message });
            }
        }


        [HttpPost]
        public async Task<IActionResult> Crearusuario([FromBody] usuario usuario)
        {
            try
            {
                var response = await usuario_repositories.usuario(usuario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al crear el historial clínico.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Actualizarusuario([FromBody] usuario usuario)
        {
            try

            {
                var response = await usuario_repositories.Putusuario(usuario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el historial clínico.", detalle = ex.Message });
            }
        }
    }
}