using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;

    [Route("api/Diario")]
    [ApiController]
    public class DiarioController : ControllerBase
   
    {
        private readonly IDiario diarioRepository;

        public DiarioController(IDiario diarioRepository)
        {
            this.diarioRepository = diarioRepository;
        }
        [HttpGet]
        public async Task<IActionResult> ListarDiarios()
        {
            try

            {
                var response = await diarioRepository.Getdiario();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener los diarios.", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerDiario(int id)
        { 
                try
        {
            var response = await diarioRepository.GetdiarioById(id);
            return response == null ? NotFound() : Ok(response);
        }
                catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el Diario.", detalle = ex.Message });
            }
        }

        [HttpGet("Usuario/{id_usuario:int}")]
        public async Task<IActionResult> ObtenerDiarioPorUsuario(int id_usuario)
        {
            try
            {
                var response = await diarioRepository.GetdiarioByUsuario(id_usuario);
                return response == null
                    ? NotFound(new { mensaje = "El Usuario aún no tiene un Diario." })
                    : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el Diario del Usuario.", detalle = ex.Message });
            }
        }

        [HttpPost("crear")]
        public async Task<IActionResult> crear_diario([FromBody] Diario Diario)
        {
            try
            {

                if (Diario == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(Diario.contenido))
                {
                    return BadRequest(new { mensaje = "El contenido del Diario es obligatorio." });
                }

                // Un aprendiz tiene UN SOLO Diario: si ya existe, esta llamada agrega una actualización.
                var response = await diarioRepository.UpsertDiario(Diario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear el Diario.", detalle = ex.Message });
            }
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> CrearDiario([FromBody] Diario Diario)
        {
            try
            {
                if (Diario == null || string.IsNullOrWhiteSpace(Diario.contenido))
                {
                    return BadRequest(new { mensaje = "El contenido del Diario es obligatorio." });
                }

                var response = await diarioRepository.UpsertDiario(Diario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al crear el Diario.", detalle = ex.Message });
            }
        }
        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarDiario(int id, [FromBody] Diario Diario)
        { 
            try
        {
            if (Diario == null)
            {
                return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
            }

            if (id != Diario.id_diario)
            {
                return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
            }

            var response = await diarioRepository.Putdiario(Diario);
            return response == null ? NotFound() : Ok(response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el Diario.", detalle = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarDiario(int id)
        {
            try
            {
                var response = await diarioRepository.Deletediario(id);
                return response ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al eliminar el Diario.", detalle = ex.Message });
            }
        }
    }
}
