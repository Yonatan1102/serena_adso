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
    public class EstadoDeAnimoController : ControllerBase
    {
        private readonly IEstadoDeAnimo  EstadoDeAnimoRepository;

        public EstadoDeAnimoController(IEstadoDeAnimo estado_de_animorepositories)
        {
            this.EstadoDeAnimoRepository = estado_de_animorepositories;
        }
        
        [HttpGet]
        public async Task<IActionResult> Listar_cita()
        {
            try
            { 

            var response = await EstadoDeAnimoRepository.Getestado_de_animo();
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
                var response = await EstadoDeAnimoRepository.Getestado_de_animoById(id);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el estado de ánimo.", detalle = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> IEstadoDeAnimo([FromBody] EstadoDeAnimo EstadoDeAnimo)
        {
            try
            {

                if (EstadoDeAnimo == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(EstadoDeAnimo.nombre_estado))
                {
                    return BadRequest(new { mensaje = "El nombre del estado es obligatorio." });
                }

                var response = await EstadoDeAnimoRepository.Postestado_de_animo(EstadoDeAnimo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarCita(int id, [FromBody] EstadoDeAnimo EstadoDeAnimo)
        {
            try
            {
                if (EstadoDeAnimo == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (id != EstadoDeAnimo.id_estado)
                {
                    return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
                }

                var response = await EstadoDeAnimoRepository.Putestado_de_animo(EstadoDeAnimo);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el estado de ánimo.", detalle = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarEstadoDeAnimo(int id)
        {
            try
            {
                var response = await EstadoDeAnimoRepository.Deleteestado_de_animo(id);
                return response ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al eliminar el estado de ánimo.", detalle = ex.Message });
            }
        }
    }
}
