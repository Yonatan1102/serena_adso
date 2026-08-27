using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class emergencia_repositories : Iemergencia
{
    private readonly serena context;
    public emergencia_repositories(serena context)=>this.context=context;
    public Task<List<emergencia>> Getemergencia()=>context.emergencia.AsNoTracking().ToListAsync();
    public Task<emergencia?> GetemergenciaById(int id)=>context.emergencia.FindAsync(id).AsTask();
    public async Task<emergencia> Postemergencia(emergencia value){context.emergencia.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<emergencia?> Putemergencia(emergencia value){var item=await context.emergencia.FindAsync(value.id_emergencia);if(item==null)return null;item.descripcion=value.descripcion;await context.SaveChangesAsync();return item;}
}
