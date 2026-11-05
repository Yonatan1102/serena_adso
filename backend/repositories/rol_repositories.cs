using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class RolRepository : IRol
{
    private readonly SerenaDbContext context;
    public RolRepository(SerenaDbContext context)=>this.context=context;
    public Task<List<Rol>> Getrol()=>context.Rol.AsNoTracking().ToListAsync();
    public Task<Rol?> GetrolById(int id)=>context.Rol.FindAsync(id).AsTask();
    public async Task<Rol> Postrol(Rol value){context.Rol.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<Rol?> Putrol(Rol value){var item=await context.Rol.FindAsync(value.id_rol);if(item==null)return null;item.nombre_rol=value.nombre_rol;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deleterol(int id){var item=await context.Rol.FindAsync(id);if(item==null)return false;context.Rol.Remove(item);await context.SaveChangesAsync();return true;}
}
