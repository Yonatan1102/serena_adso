using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EmergenciaController : ControllerBase
{
    private readonly Iemergencia repository;
    public EmergenciaController(Iemergencia repository)=>this.repository=repository;
    [HttpGet] public async Task<IActionResult> Get()=>Ok(await repository.Getemergencia());
    [HttpGet("{id:int}")] public async Task<IActionResult> Get(int id){var item=await repository.GetemergenciaById(id);return item==null?NotFound():Ok(item);}
    [HttpPost] public async Task<IActionResult> Post([FromBody] emergencia value){if(!ModelState.IsValid)return ValidationProblem(ModelState);var item=await repository.Postemergencia(value);return CreatedAtAction(nameof(Get),new{id=item.id_emergencia},item);}
    [HttpPut("{id:int}")] public async Task<IActionResult> Put(int id,[FromBody] emergencia value){if(id!=value.id_emergencia)return BadRequest();var item=await repository.Putemergencia(value);return item==null?NotFound():Ok(item);}
}
