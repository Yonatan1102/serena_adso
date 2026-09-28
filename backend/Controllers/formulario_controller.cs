using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormularioController : ControllerBase
{
    private readonly Iformulario repository;
    public FormularioController(Iformulario repository)=>this.repository=repository;
    [HttpGet] 
    public async Task<IActionResult> Get()=>Ok(await repository.Getformulario());
    [HttpGet("{id:int}")] 
    public async Task<IActionResult> Get(int id){var item=await repository.GetformularioById(id);return item==null?NotFound():Ok(item);}
    [HttpPost]
     public async Task<IActionResult> Post([FromBody] formulario value){if(!ModelState.IsValid)return ValidationProblem(ModelState);var item=await repository.Postformulario(value);return CreatedAtAction(nameof(Get),new{id=item.id_formulario},item);}
    [HttpPut("{id:int}")]
     public async Task<IActionResult> Put(int id,[FromBody] formulario value){if(id!=value.id_formulario)return BadRequest();var item=await repository.Putformulario(value);return item==null?NotFound():Ok(item);}
    [HttpDelete("{id:int}")]
     public async Task<IActionResult> Delete(int id)=>await repository.Deleteformulario(id)?NoContent():NotFound();
}
