using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System.Security.Claims;
using WebApplication1.interfaces;
using WebApplication1.models;
using WebApplication1.services;

namespace WebApplication1.Controllers
{
    [Route("api/cita")]
    [ApiController]
    [Authorize]
    public class cita_Controller : ControllerBase
    {
        private readonly Icita cita_repositories;
        private readonly IRecaptchaService recaptchaService;
        private readonly ILogger<cita_Controller> logger;

        public cita_Controller(Icita cita_repositories, IRecaptchaService recaptchaService, ILogger<cita_Controller> logger)
        {
            this.cita_repositories = cita_repositories;
            this.recaptchaService = recaptchaService;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> listar_cita()
        { 
            try
        {
            var response = await cita_repositories.Getcita();
            if (User.IsInRole("Admin"))
                return Ok(response);

            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var filtered = User.IsInRole("Psicosocial")
                ? response.Where(item => item.id_usuario_psicologo == userId)
                : response.Where(item => item.id_usuario_aprendiz == userId);
            return Ok(filtered);
        }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error consultando orientaciones.");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> obtener_cita(int id)
        {
            try
            {
                var response = await cita_repositories.GetcitaById(id);
                if (response == null) return NotFound();
                if (!User.IsInRole("Admin") &&
                    (!TryGetUserId(out var userId) ||
                     (response.id_usuario_aprendiz != userId && response.id_usuario_psicologo != userId)))
                    return Forbid();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("agendar")]
        [Authorize(Roles = "Aprendiz")]
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

                if (!TryGetUserId(out var aprendizId))
                    return Unauthorized();
                cita.id_usuario_aprendiz = aprendizId;
                cita.estado_cita = "Pendiente";

                if (!await recaptchaService.VerifyAsync(cita.recaptchaToken ?? string.Empty, HttpContext.Connection.RemoteIpAddress?.ToString(), HttpContext.RequestAborted))
                    return BadRequest(new { mensaje = "No fue posible validar reCAPTCHA. Inténtalo nuevamente." });

                var response = await cita_repositories.Postcita(cita);
                return CreatedAtAction(nameof(obtener_cita), new { id = response.id_cita }, response);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { mensaje = ex.Message });
            }
            catch (RecaptchaUnavailableException)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { mensaje = "El servicio de validación reCAPTCHA no está disponible." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al crear una orientación.");
                return StatusCode(500, new { mensaje = "Error interno al crear la orientación." });
            }
        }

        [HttpPost("registrar")]
        [Authorize(Roles = "Aprendiz")]
        public async Task<IActionResult> registrar_cita([FromBody] cita cita)
        { 
            try 
        {
            if (cita == null || cita.fecha_hora == default || string.IsNullOrWhiteSpace(cita.motivo))
            {
                return BadRequest(new { mensaje = "La fecha, el motivo y el cuerpo de la cita son obligatorios." });
            }

            if (!TryGetUserId(out var aprendizId))
                return Unauthorized();
            cita.id_usuario_aprendiz = aprendizId;
            cita.estado_cita = "Pendiente";

            if (!await recaptchaService.VerifyAsync(cita.recaptchaToken ?? string.Empty, HttpContext.Connection.RemoteIpAddress?.ToString(), HttpContext.RequestAborted))
                return BadRequest(new { mensaje = "No fue posible validar reCAPTCHA. Inténtalo nuevamente." });

            var response = await cita_repositories.Postcita(cita);
            return CreatedAtAction(nameof(obtener_cita), new { id = response.id_cita }, response);
        }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { mensaje = ex.Message });
            }
            catch (RecaptchaUnavailableException)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { mensaje = "El servicio de validación reCAPTCHA no está disponible." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al registrar una orientación.");
                return StatusCode(500, "Error interno al crear la orientación.");
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Psicosocial")]
        public async Task<IActionResult> actualizar_cita(int id, [FromBody] cita cita)
        {
            try
            {
                if (cita == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (id != cita.id_cita)
                {
                    return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
                }

                var existente = await cita_repositories.GetcitaById(id);
                if (existente is null) return NotFound();
                if (!TryGetUserId(out var psicosocialId))
                    return Unauthorized();
                if (existente.id_usuario_psicologo != psicosocialId)
                    return Forbid();

                var transicionValida = existente.estado_cita switch
                {
                    "Pendiente" => cita.estado_cita is "Confirmada" or "Rechazada" or "Cancelada",
                    "Confirmada" => cita.estado_cita is "Realizada" or "Cancelada",
                    _ => false
                };
                if (!transicionValida)
                    return Conflict(new { mensaje = "La orientación ya no admite esa transición de estado." });

                cita.id_usuario_aprendiz = existente.id_usuario_aprendiz;
                cita.id_usuario_psicologo = existente.id_usuario_psicologo;
                cita.fecha_hora = existente.fecha_hora;
                cita.motivo = existente.motivo;

                var response = await cita_repositories.Putcita(cita);
                return response == null ? NotFound() : Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al actualizar una orientación.");
                return StatusCode(500, "Error interno al actualizar la orientación.");
            }       
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> cancelar_cita(int id)
        {
            var existente = await cita_repositories.GetcitaById(id);
            if (existente is null) return NotFound();
            if (!User.IsInRole("Admin") &&
                (!TryGetUserId(out var userId) ||
                 (existente.id_usuario_aprendiz != userId && existente.id_usuario_psicologo != userId)))
                return Forbid();
            return await cita_repositories.Deletecita(id) ? NoContent() : NotFound();
        }

        private bool TryGetUserId(out int userId) =>
            int.TryParse(User.FindFirstValue("id_usuario"), out userId);

    }
    [Route("api/historial-cita")]
       [ApiController]        
    public class historial_cita_controller : ControllerBase
    {
        private readonly Ihistorial_cita historial_cita_repositories;

        public historial_cita_controller(Ihistorial_cita historial_cita_repositories)
        {
            this.historial_cita_repositories = historial_cita_repositories;
        }
        [HttpGet]
        public async Task<IActionResult> ListarHistorialCitas()
        {
            try
            {
                var response = await historial_cita_repositories.Gethistorial_cita();
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
                var response = await historial_cita_repositories.Gethistorial_citaById(id);
                if (response == null) return NotFound(new { mensaje = $"Historial de cita con ID {id} no encontrado" });
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al obtener el historial de cita.", detalle = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> observaviones_cita([FromBody] historial_cita historialCita)
        {
            try
            {

                if (historialCita == null)
                {
                    return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                }

                if (string.IsNullOrWhiteSpace(historialCita.observaciones_historial))
                {
                    return BadRequest(new { mensaje = "Las observaciones del historial de cita son obligatorias." });
                }

                var response = await historial_cita_repositories.Posthistorial_cita(historialCita);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al crear la publicación.", detalle = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> ActualizarHistorialCita([FromBody] historial_cita historialCita)
        {
            try
            {
                var response = await historial_cita_repositories.Puthistorial_cita(historialCita);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el historial de cita.", detalle = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarHistorialCita(int id)
        {
            try
            {
                var response = await historial_cita_repositories.Deletehistorial_cita(id);
                return response ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al eliminar el historial de cita.", detalle = ex.Message });
            }
        }
    }
}