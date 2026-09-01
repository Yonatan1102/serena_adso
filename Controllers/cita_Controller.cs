using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    [Route("api/cita")]
    [ApiController]
    public class cita_Controller : ControllerBase
    {
        private readonly Icita cita_repositories;

        public cita_Controller(Icita cita_repositories)
        {
            this.cita_repositories = cita_repositories;
        }

        [HttpGet]
        public async Task<IActionResult> listar_cita()
        { 
            try
        {
            var response = await cita_repositories.Getcita();
            return Ok(response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> obtener_cita(int id)
        {
            try
            {
                var response = await cita_repositories.GetcitaById(id);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("agendar")]
        public async Task<IActionResult> agendar_cita([FromBody] cita cita)
        {
            try
            {

                if (cita == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (cita.fecha_hora == default)
                {
                    return BadRequest(new { mensaje = "La fecha y hora de la cita es obligatoria." });
                }

                var response = await cita_repositories.Postcita(cita);
                return CreatedAtAction(nameof(obtener_cita), new { id = response.id_cita }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la cita.", detalle = ex.Message });
            }
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> registrar_cita([FromBody] cita cita)
        { 
            try 
        {

            var response = await cita_repositories.Postcita(cita);
            return Ok(response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPut]
        public async Task<IActionResult> actualizar_cita([FromBody] cita cita)
        {
            try
            {
                var response = await cita_repositories.Putcita(cita);
                return Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }       
        }
        private IActionResult Ok(cita? response)
        {
            throw new NotImplementedException();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> cancelar_cita(int id)
        {
            return await cita_repositories.Deletecita(id) ? NoContent() : NotFound();
        }

     


    }
    [Route("api/historial-cita")]
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