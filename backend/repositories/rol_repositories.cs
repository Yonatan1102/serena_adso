using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class rol_repositories : Irol
{
    private readonly serena context;
    public rol_repositories(serena context)=>this.context=context;
    public Task<List<rol>> Getrol()=>context.rol.AsNoTracking().ToListAsync();
    public Task<rol?> GetrolById(int id)=>context.rol.FindAsync(id).AsTask();
    public async Task<rol> Postrol(rol value){context.rol.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<rol?> Putrol(rol value){var item=await context.rol.FindAsync(value.id_rol);if(item==null)return null;item.nombre_rol=value.nombre_rol;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deleterol(int id){var item=await context.rol.FindAsync(id);if(item==null)return false;context.rol.Remove(item);await context.SaveChangesAsync();return true;}
}
