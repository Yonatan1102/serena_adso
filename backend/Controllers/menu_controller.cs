using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly Imenu repository;
    public MenuController(Imenu repository) => this.repository = repository;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await repository.Getmenu());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await repository.GetmenuById(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] menu value)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (value == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });

        var item = await repository.Postmenu(value);
        return CreatedAtAction(nameof(Get), new { id = item.id_menu }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] menu value)
    {
        if (id != value.id_menu) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var item = await repository.Putmenu(value);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await repository.Deletemenu(id) ? NoContent() : NotFound();
}
