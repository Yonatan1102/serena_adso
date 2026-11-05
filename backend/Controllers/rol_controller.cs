using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    [Route("api/Rol")]
    [ApiController]
    public class RolController : ControllerBase
    {
        private readonly IRol RolRepository;

        public RolController(IRol RolRepository)
        {
            this.RolRepository = RolRepository;
        }

        [HttpGet]
        public async Task<IActionResult> listar_rol()
        { 
            try
        {
            var response = await RolRepository.Getrol();
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
                var response = await RolRepository.GetrolById(id);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("agendar")]
        public async Task<IActionResult> agendar_rol([FromBody] Rol Rol)
        {
            try
            {

                if (Rol == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(Rol.nombre_rol))
                {
                    return BadRequest(new { mensaje = "La fecha y hora de la Cita es obligatoria." });
                }

                var response = await RolRepository.Postrol(Rol);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la Cita.", detalle = ex.Message });
            }
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> registrar_rol([FromBody] Rol Rol)
        { 
            try 
        {

            var response = await RolRepository.Postrol(Rol);
            return Ok(response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> actualizar_rol(int id, [FromBody] Rol Rol  )
        {
            try
            {
                if (Rol == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (id != Rol.id_rol)
                {
                    return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
                }

                var response = await RolRepository.Putrol(Rol);
                return response == null ? NotFound() : Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }       
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> eliminar_rol(int id)
        {
            return await RolRepository.Deleterol(id) ? NoContent() : NotFound();
        }
    }
}
