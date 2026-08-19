using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.models;
using WebApplication1.publicaionesrepositories;
using WebApplication1.repositories.interfaces;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.historial_clinico_repositories;

    [Route("api/[controller]")]
    [ApiController]
    public class diario_controller : ControllerBase
   
    {
        private readonly Idiario diarioRepository;

        public diario_controller(Idiario diarioRepository)
        {
            diarioRepository = diarioRepository;
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
            return Ok(response);
        }
                catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el diario.", detalle = ex.Message });
            }
        }

        [HttpPost]
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
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear el diario.", detalle = ex.Message });
            }
        }

        [HttpPost]
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
    }
}
