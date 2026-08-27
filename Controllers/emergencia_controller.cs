using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using WebApplication1.models;

namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.interfaces;
    using WebApplication1.repositories;

    [Route("api/[controller]")]
    [ApiController]
[Route("api/[controller]")]
public class emergencia_Controller : ControllerBase
{
    [HttpGet]
    public IActionResult ObtenerEmergencias()
    {
        return Ok("Lista de emergencias");
    }

    [HttpGet("{id}")]
    public IActionResult ObtenerEmergencia(int id)
    {
        return Ok($"Emergencia con ID: {id}");
    }

    [HttpPost]
    public IActionResult CrearEmergencia(emergencia emergencia)
    {
        return Ok(emergencia);
    }

    [HttpPut("{id}")]
    public IActionResult ActualizarEmergencia(
        int id,
        emergencia emergencia)
    {
        return Ok(emergencia);
    }
}