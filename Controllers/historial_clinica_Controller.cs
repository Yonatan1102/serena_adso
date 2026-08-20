using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.historial_cita_repositories;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;
    using WebApplication1.publicaionesrepositories;

    [Route("api/[controller]")]
    [ApiController]
    public class historial_clinico_controller : ControllerBase
    {
        private readonly Ihistorial_clinico historial_clinico_repositories;

        public historial_clinico_controller(Ihistorial_clinico historial_clinico_repositories)
        {
            this.historial_clinico_repositories = historial_clinico_repositories;
        }
        [HttpGet]
        public async Task<IActionResult> ListarHistorialClinicos()
        {
            try
            {
                var response = await historial_clinico_repositories.Gethistorial_clinico();
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
                var response = await historial_clinico_repositories.Gethistorial_clinicoById(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el historial clínico.", detalle = ex.Message });
            }

        }
        [HttpPost]
        public async Task<IActionResult> crear_historial_clinico([FromBody] historial_clinico historial_clinico)
        {
            try
            {

                if (historial_clinico == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (historial_clinico.id_usuario == 0)
                {
                    return BadRequest(new { mensaje = "El usuario del historial clínico es obligatorio." });
                }

                var response = await historial_clinico_repositories.Posthistorial_clinico(historial_clinico);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear el historial clínico.", detalle = ex.Message });
            }
        }


        [HttpPost]
        public async Task<IActionResult> CrearHistorialClinico([FromBody] historial_clinico historialClinico)
        {
            try
            {
                var response = await historial_clinico_repositories.Posthistorial_clinico(historialClinico);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al crear el historial clínico.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> ActualizarHistorialClinico([FromBody] historial_clinico historialClinico)
        {
            try

            {
                var response = await historial_clinico_repositories.Puthistorial_clinico(historialClinico);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el historial clínico.", detalle = ex.Message });
            }
        }
    }
}