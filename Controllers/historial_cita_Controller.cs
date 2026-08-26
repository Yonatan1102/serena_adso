using WebApplication1.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;



namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;

    [Route("api/[controller]")]
    [ApiController]
    public class historial_cita_controller : ControllerBase
    {
        private readonly Ihistorial_cita historial_cita_repositories;

        public historial_cita_controller(Ihistorial_cita historial_cita_repositories)
        {
            this.historial_cita_repositories = historial_cita_repositories;
        }
        [HttpGet]
        public async Task<IActionResult> ListarHistorialCitas()
        {
            try
            {
                var response = await historial_cita_repositories.Gethistorial_cita();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener los historiales de citas.", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerHistorialCita(int id)
        {
            try
            {
                var response = await historial_cita_repositories.Gethistorial_citaById(id);
                if (response == null) return NotFound(new { mensaje = $"Historial de cita con ID {id} no encontrado" });
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el historial de cita.", detalle = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> observaviones_cita([FromBody] historial_cita historialCita)
        {
            try
            {

                if (historialCita == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(historialCita.observaciones_historial))
                {
                    return BadRequest(new { mensaje = "Las observaciones del historial de cita son obligatorias." });
                }

                var response = await historial_cita_repositories.Posthistorial_cita(historialCita);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> ActualizarHistorialCita([FromBody] historial_cita historialCita)
        {
            try
            {
                var response = await historial_cita_repositories.Puthistorial_cita(historialCita);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el historial de cita.", detalle = ex.Message });
            }
        }
    }
}
