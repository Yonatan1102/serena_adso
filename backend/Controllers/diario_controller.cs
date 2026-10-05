using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;

    [Route("api/diario")]
    [ApiController]
    public class diario_controller : ControllerBase
   
    {
        private readonly Idiario diarioRepository;

        public diario_controller(Idiario diarioRepository)
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
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el diario.", detalle = ex.Message });
            }
        }

        [HttpGet("usuario/{id_usuario:int}")]
        public async Task<IActionResult> ObtenerDiarioPorUsuario(int id_usuario)
        {
            try
            {
                var response = await diarioRepository.GetdiarioByUsuario(id_usuario);
                return response == null
                    ? NotFound(new { mensaje = "El usuario aún no tiene un diario." })
                    : Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el diario del usuario.", detalle = ex.Message });
            }
        }

        [HttpPost("crear")]
        public async Task<IActionResult> crear_diario([FromBody] diario diario)
        {
            try
            {

                if (diario == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(diario.contenido))
                {
                    return BadRequest(new { mensaje = "El contenido del diario es obligatorio." });
                }

                // Un aprendiz tiene UN SOLO diario: si ya existe, esta llamada agrega una actualización.
                var response = await diarioRepository.UpsertDiario(diario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear el diario.", detalle = ex.Message });
            }
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> CrearDiario([FromBody] diario diario)
        {
            try
            {
                if (diario == null || string.IsNullOrWhiteSpace(diario.contenido))
                {
                    return BadRequest(new { mensaje = "El contenido del diario es obligatorio." });
                }

                var response = await diarioRepository.UpsertDiario(diario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al crear el diario.", detalle = ex.Message });
            }
        }
        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarDiario(int id, [FromBody] diario diario)
        { 
            try
        {
            if (diario == null)
            {
                return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
            }

            if (id != diario.id_diario)
            {
                return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
            }

            var response = await diarioRepository.Putdiario(diario);
            return response == null ? NotFound() : Ok(response);
        }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el diario.", detalle = ex.Message });
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
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al eliminar el diario.", detalle = ex.Message });
            }
        }
    }
}
