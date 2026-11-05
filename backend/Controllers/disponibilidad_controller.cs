using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.Controllers;

[ApiController]
[Tags("Disponibilidad")]
[ApiExplorerSettings(GroupName = "Disponibilidad")]
[Route("api/Disponibilidad")]
public class DisponibilidadController : ControllerBase
{
    private readonly IDisponibilidad repository;
    public DisponibilidadController(IDisponibilidad repository)=>this.repository=repository;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await repository.Getdisponibilidad());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await repository.GetdisponibilidadById(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Disponibilidad value)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (value == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });

        var item = await repository.Postdisponibilidad(value);
        return CreatedAtAction(nameof(Get), new { id = item.id_disponibilidad }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] Disponibilidad value)
    {
        if (id != value.id_disponibilidad) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var item = await repository.Putdisponibilidad(value);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await repository.Deletedisponibilidad(id) ? NoContent() : NotFound();
}
