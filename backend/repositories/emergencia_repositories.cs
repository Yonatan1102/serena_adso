using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class EmergenciaRepository : IEmergencia
{
    private readonly SerenaDbContext context;
    public EmergenciaRepository(SerenaDbContext context)=>this.context=context;
    public Task<List<Emergencia>> Getemergencia()=>context.Emergencia.AsNoTracking().ToListAsync();
    public Task<Emergencia?> GetemergenciaById(int id)=>context.Emergencia.FindAsync(id).AsTask();
    public async Task<Emergencia> Postemergencia(Emergencia value){context.Emergencia.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<Emergencia?> Putemergencia(Emergencia value){var item=await context.Emergencia.FindAsync(value.id_emergencia);if(item==null)return null;item.descripcion=value.descripcion;item.fecha_emergencia=value.fecha_emergencia;item.id_usuario=value.id_usuario;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deleteemergencia(int id){var item=await context.Emergencia.FindAsync(id);if(item==null)return false;context.Emergencia.Remove(item);await context.SaveChangesAsync();return true;}
}
