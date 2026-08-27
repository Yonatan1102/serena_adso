using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    [Route("api/rol")]
    [ApiController]
    public class rol_Controller : ControllerBase
    {
        private readonly Irol rol_repositories;

        public rol_Controller(Irol rol_repositories)
        {
            this.rol_repositories = rol_repositories;
        }

        [HttpGet]
        public async Task<IActionResult> listar_rol()
        { 
            try
        {
            var response = await rol_repositories.Getrol();
            return Ok(response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> obtener_rol(int id)
        {
            try
            {
                var response = await rol_repositories.GetrolById(id);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("agendar")]
        public async Task<IActionResult> agendar_rol([FromBody] rol rol)
        {
            try
            {

                if (rol == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(rol.nombre_rol))
                {
                    return BadRequest(new { mensaje = "La fecha y hora de la cita es obligatoria." });
                }

                var response = await rol_repositories.Postrol(rol);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la cita.", detalle = ex.Message });
            }
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> registrar_rol([FromBody] rol rol)
        { 
            try 
        {

            var response = await rol_repositories.Postrol(rol);
            return Ok(response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPut]
        public async Task<IActionResult> actualizar_rol([FromBody] rol rol  )
        {
            try
            {
                var response = await rol_repositories.Putrol(rol);
                return Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }       
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> eliminar_rol(int id)
        {
            return await rol_repositories.Deleterol(id) ? NoContent() : NotFound();
        }
    }
}
