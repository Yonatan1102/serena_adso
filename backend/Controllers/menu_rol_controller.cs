using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuRolController : ControllerBase
{
    private readonly Imenu_rol repository;
    public MenuRolController(Imenu_rol repository) => this.repository = repository;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await repository.Getmenu_rol());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await repository.Getmenu_rolById(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] menu_rol value)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (value == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });

        var item = await repository.Postmenu_rol(value);
        return CreatedAtAction(nameof(Get), new { id = item.id_menu_rol }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Put(int id, [FromBody] menu_rol value)
    {
        if (id != value.id_menu_rol) return BadRequest(new { mensaje = "El ID de la ruta no coincide con el cuerpo." });
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var item = await repository.Putmenu_rol(value);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await repository.Deletemenu_rol(id) ? NoContent() : NotFound();
}
