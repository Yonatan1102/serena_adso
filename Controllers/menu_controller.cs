using Microsoft.AspNetCore.Mvc;
using WebApplication1.interfaces;
namespace WebApplication1.Controllers;
[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly Imenu repository;
    public MenuController(Imenu repository)=>this.repository=repository;
    [HttpGet] public async Task<IActionResult> Get()=>Ok(await repository.Getmenu());
}
