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

                var response = await diarioRepository.Postdiario(diario);
                return CreatedAtAction(nameof(ObtenerDiario), new { id = response.id_diario }, response);
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
                var response = await diarioRepository.Postdiario(diario);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al crear el diario.", detalle = ex.Message });
            }
        }
        [HttpPut]
        public async Task<IActionResult> ActualizarDiario([FromBody] diario diario)
        { 
            try
        {
            var response = await diarioRepository.Putdiario(diario);
            return Ok(response);
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
