using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
namespace WebApplication1.Controllers;
[ApiController]
[Route("api/[controller]")]
public class MenuRolController : ControllerBase
{
    private readonly Imenu_rol repository;
    public MenuRolController(Imenu_rol repository)=>this.repository=repository;
    [HttpGet] public async Task<IActionResult> Get()=>Ok(await repository.Getmenu_rol());
}
