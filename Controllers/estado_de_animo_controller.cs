using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;
    using WebApplication1.repositories;

    [Route("api/estado-animo")]
    [ApiController]
    public class estado_de_animo_controller : ControllerBase
    {
        private readonly Iestado_de_animo  estado_de_animo_repositories;

        public estado_de_animo_controller(Iestado_de_animo estado_de_animorepositories)
        {
            this.estado_de_animo_repositories = estado_de_animorepositories;
        }
        
        [HttpGet]
        public async Task<IActionResult> Listar_cita()
        {
            try
            { 

            var response = await estado_de_animo_repositories.Getestado_de_animo();
            return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener los estados de ánimo.", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerEstadoDeAnimo(int id)
        {
            try
            {
                var response = await estado_de_animo_repositories.Getestado_de_animoById(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el estado de ánimo.", detalle = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Iestado_de_animo([FromBody] estado_de_animo estado_de_animo)
        {
            try
            {

                if (estado_de_animo == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (estado_de_animo.id_usuario == 0)
                {
                    return BadRequest(new { mensaje = "El usuario del historial clínico es obligatorio." });
                }

                var response = await estado_de_animo_repositories.Postestado_de_animo(estado_de_animo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> ActualizarCita([FromBody] estado_de_animo estado_de_animo)
        {
            try
            {
                var response = await estado_de_animo_repositories.Putestado_de_animo(estado_de_animo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el estado de ánimo.", detalle = ex.Message });
            }
        }
    }
}
