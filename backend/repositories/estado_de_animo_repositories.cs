using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class EstadoDeAnimoRepository : IEstadoDeAnimo
{
    private readonly SerenaDbContext context;
    public EstadoDeAnimoRepository(SerenaDbContext context)=>this.context=context;
    public Task<List<EstadoDeAnimo>> Getestado_de_animo()=>context.EstadoDeAnimo.AsNoTracking().ToListAsync();
    public Task<EstadoDeAnimo?> Getestado_de_animoById(int id)=>context.EstadoDeAnimo.FindAsync(id).AsTask();
    public async Task<EstadoDeAnimo> Postestado_de_animo(EstadoDeAnimo value){context.EstadoDeAnimo.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<EstadoDeAnimo?> Putestado_de_animo(EstadoDeAnimo value){var item=await context.EstadoDeAnimo.FindAsync(value.id_estado);if(item==null)return null;item.nombre_estado=value.nombre_estado;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deleteestado_de_animo(int id){var item=await context.EstadoDeAnimo.FindAsync(id);if(item==null)return false;context.EstadoDeAnimo.Remove(item);await context.SaveChangesAsync();return true;}
}
