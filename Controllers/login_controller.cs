using WebApplication1.models;
using WebApplication1.interfaces;
using WebApplication1.repositories;

namespace WebApplication1.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly Iloginservice _loginService;

        public LoginController(Iloginservice loginservice)
        {
            _loginservice = loginservice;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar(usuario usuario)
        {
            var usuarioExistente =
                await _loginService.BuscarPorCorreo(usuario.email);

            if (usuarioExistente != null)
            {
                return BadRequest("El correo ya está registrado.");
            }

            var nuevoUsuario =
                await _loginService.Registrar(usuario);

            return Ok(nuevoUsuario);
        }
    }
}