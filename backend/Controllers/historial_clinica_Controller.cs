using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;

    [Route("api/historial-clinico")]
    [ApiController]
    public class HistorialClinicoController : ControllerBase
    {
        private readonly IHistorialClinico HistorialClinicoRepository;

        public HistorialClinicoController(IHistorialClinico HistorialClinicoRepository)
        {
            this.HistorialClinicoRepository = HistorialClinicoRepository;
        }
        [HttpGet]
        public async Task<IActionResult> ListarHistorialClinicos()
        {
            try
            {
                var response = await HistorialClinicoRepository.Gethistorial_clinico();
                return Ok(response);
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener los historiales clínicos.", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerHistorialClinico(int id)
        {
            try
            {
                var response = await HistorialClinicoRepository.Gethistorial_clinicoById(id);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el historial clínico.", detalle = ex.Message });
            }

        }
        [HttpPost("crear")]
        public async Task<IActionResult> crear_historial_clinico([FromBody] HistorialClinico HistorialClinico)
        {
            try
            {

                if (HistorialClinico == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (HistorialClinico.id_usuario == 0)
                {
                    return BadRequest(new { mensaje = "El Usuario del historial clínico es obligatorio." });
                }

                var response = await HistorialClinicoRepository.Posthistorial_clinico(HistorialClinico);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear el historial clínico.", detalle = ex.Message });
            }
        }


        [HttpPost("registrar")]
        public async Task<IActionResult> CrearHistorialClinico([FromBody] HistorialClinico historialClinico)
        {
            try
            {
                var response = await HistorialClinicoRepository.Posthistorial_clinico(historialClinico);
                return CreatedAtAction(nameof(ObtenerHistorialClinico), new { id = response.id_h_clinico }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al crear el historial clínico.", detalle = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarHistorialClinico(int id, [FromBody] HistorialClinico historialClinico)
        {
            try

            {
                if (historialClinico == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (id != historialClinico.id_h_clinico)
                {
                    return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
                }

                var response = await HistorialClinicoRepository.Puthistorial_clinico(historialClinico);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el historial clínico.", detalle = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarHistorialClinico(int id)
        {
            try
            {
                var response = await HistorialClinicoRepository.Deletehistorial_clinico(id);
                return response ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al eliminar el historial clínico.", detalle = ex.Message });
            }
        }
    }
}