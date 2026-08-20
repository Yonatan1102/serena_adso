using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.cita_repositories;
using WebApplication1.interfaces;
using WebApplication1.models;
using WebApplication1.publicaionesrepositories;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class cita_Controller : ControllerBase
    {
        private readonly Icita cita_repositoryRepositories;
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
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost]
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
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la cita.", detalle = ex.Message });
            }
        }

        [HttpPost]
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
    }
}
