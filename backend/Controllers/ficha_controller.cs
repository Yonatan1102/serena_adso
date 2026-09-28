using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Tags("Ficha")]
[ApiExplorerSettings(GroupName = "Ficha")]
[Route("api/ficha")]
public class ficha_Controller : ControllerBase
{
    private readonly Ificha repository;

    public ficha_Controller(Ificha repository) => this.repository = repository;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await repository.Getficha());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await repository.GetfichaById(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ficha value)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (value == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });

        var item = await repository.Postficha(value);
        return CreatedAtAction(nameof(Get), new { id = item.id_ficha }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] ficha value)
    {
        if (id != value.id_ficha) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var item = await repository.Putficha(value);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await repository.Deleteficha(id) ? NoContent() : NotFound();
}
