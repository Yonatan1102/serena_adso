using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    [Route("api/Cita")]
    [ApiController]
    public class CitaController : ControllerBase
    {
        private readonly ICita CitaRepository;

        public CitaController(ICita CitaRepository)
        {
            this.CitaRepository = CitaRepository;
        }

        [HttpGet]
        public async Task<IActionResult> listar_cita()
        { 
            try
        {
            var response = await CitaRepository.Getcita();
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
                var response = await CitaRepository.GetcitaById(id);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("agendar")]
        public async Task<IActionResult> agendar_cita([FromBody] Cita Cita)
        {
            try
            {

                if (Cita == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (Cita.fecha_hora == default)
                {
                    return BadRequest(new { mensaje = "La fecha y hora de la Cita es obligatoria." });
                }

                var response = await CitaRepository.Postcita(Cita);
                return CreatedAtAction(nameof(obtener_cita), new { id = response.id_cita }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la Cita.", detalle = ex.Message });
            }
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> registrar_cita([FromBody] Cita Cita)
        { 
            try 
        {
            if (Cita == null || Cita.fecha_hora == default || string.IsNullOrWhiteSpace(Cita.motivo))
            {
                return BadRequest(new { mensaje = "La fecha, el motivo y el cuerpo de la Cita son obligatorios." });
            }

            var response = await CitaRepository.Postcita(Cita);
            return CreatedAtAction(nameof(obtener_cita), new { id = response.id_cita }, response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> actualizar_cita(int id, [FromBody] Cita Cita)
        {
            try
            {
                if (Cita == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (id != Cita.id_cita)
                {
                    return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
                }

                var response = await CitaRepository.Putcita(Cita);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }       
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> cancelar_cita(int id)
        {
            return await CitaRepository.Deletecita(id) ? NoContent() : NotFound();
        }

     


    }
    [Route("api/historial-Cita")]
       [ApiController]        
    public class HistorialCitaController : ControllerBase
    {
        private readonly IHistorialCita HistorialCitaRepository;

        public HistorialCitaController(IHistorialCita HistorialCitaRepository)
        {
            this.HistorialCitaRepository = HistorialCitaRepository;
        }
        [HttpGet]
        public async Task<IActionResult> ListarHistorialCitas()
        {
            try
            {
                var response = await HistorialCitaRepository.Gethistorial_cita();
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
                var response = await HistorialCitaRepository.Gethistorial_citaById(id);
                if (response == null) return NotFound(new { mensaje = $"Historial de Cita con ID {id} no encontrado" });
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el historial de Cita.", detalle = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> observaviones_cita([FromBody] HistorialCita historialCita)
        {
            try
            {

                if (historialCita == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(historialCita.observaciones_historial))
                {
                    return BadRequest(new { mensaje = "Las observaciones del historial de Cita son obligatorias." });
                }

                var response = await HistorialCitaRepository.Posthistorial_cita(historialCita);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> ActualizarHistorialCita([FromBody] HistorialCita historialCita)
        {
            try
            {
                var response = await HistorialCitaRepository.Puthistorial_cita(historialCita);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el historial de Cita.", detalle = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarHistorialCita(int id)
        {
            try
            {
                var response = await HistorialCitaRepository.Deletehistorial_cita(id);
                return response ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al eliminar el historial de Cita.", detalle = ex.Message });
            }
        }
    }
}