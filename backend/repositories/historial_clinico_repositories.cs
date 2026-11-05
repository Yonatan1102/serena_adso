using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class HistorialClinicoRepository : IHistorialClinico
{
    private readonly SerenaDbContext context;
    public HistorialClinicoRepository(SerenaDbContext context)=>this.context=context;
    public Task<List<HistorialClinico>> Gethistorial_clinico()=>context.HistorialClinico.AsNoTracking().ToListAsync();
    public Task<HistorialClinico?> Gethistorial_clinicoById(int id)=>context.HistorialClinico.FindAsync(id).AsTask();
    public async Task<HistorialClinico> Posthistorial_clinico(HistorialClinico value){context.HistorialClinico.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<HistorialClinico?> Puthistorial_clinico(HistorialClinico value){var item=await context.HistorialClinico.FindAsync(value.id_h_clinico);if(item==null)return null;item.condiciones=value.condiciones;item.antecedentes=value.antecedentes;item.num_ficha=value.num_ficha;item.fecha_apertura=value.fecha_apertura;item.id_usuario=value.id_usuario;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deletehistorial_clinico(int id){var item=await context.HistorialClinico.FindAsync(id);if(item==null)return false;context.HistorialClinico.Remove(item);await context.SaveChangesAsync();return true;}
}
