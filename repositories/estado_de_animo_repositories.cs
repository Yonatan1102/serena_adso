using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class estado_de_animo_repositories : Iestado_de_animo
{
    private readonly serena context;
    public estado_de_animo_repositories(serena context)=>this.context=context;
    public Task<List<estado_de_animo>> Getestado_de_animo()=>context.estado_de_animo.AsNoTracking().ToListAsync();
    public Task<estado_de_animo?> Getestado_de_animoById(int id)=>context.estado_de_animo.FindAsync(id).AsTask();
    public async Task<estado_de_animo> Postestado_de_animo(estado_de_animo value){context.estado_de_animo.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<estado_de_animo?> Putestado_de_animo(estado_de_animo value){var item=await context.estado_de_animo.FindAsync(value.id_estado);if(item==null)return null;item.nombre_estado=value.nombre_estado;await context.SaveChangesAsync();return item;}
}
