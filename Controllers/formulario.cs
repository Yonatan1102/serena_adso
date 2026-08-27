using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
public class FormularioController : ControllerBase
{
    [HttpGet]
    public IActionResult ObtenerFormularios()
    {
        return Ok("Lista de formularios");
    }

    [HttpGet("{id}")]
    public IActionResult ObtenerFormulario(int id)
    {
        return Ok($"Formulario con ID: {id}");
    }

    [HttpPost]
    public IActionResult CrearFormulario(formulario formulario)
    {
        return Ok(formulario);
    }

    [HttpPut("{id}")]
    public IActionResult ActualizarFormulario(
        int id,
        formulario formulario)
    {
        return Ok(formulario);
    }

    [HttpDelete("{id}")]
    public IActionResult EliminarFormulario(int id)
    {
        return Ok($"Formulario {id} eliminado");
    }
}
}
