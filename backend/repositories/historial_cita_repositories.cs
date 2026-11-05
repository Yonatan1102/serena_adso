using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class HistorialCitaRepository : IHistorialCita
{
    private readonly SerenaDbContext context;
    public HistorialCitaRepository(SerenaDbContext context)=>this.context=context;
    public Task<List<HistorialCita>> Gethistorial_cita()=>context.HistorialCita.AsNoTracking().ToListAsync();
    public Task<HistorialCita?> Gethistorial_citaById(int id)=>context.HistorialCita.FindAsync(id).AsTask();
    public async Task<HistorialCita> Posthistorial_cita(HistorialCita value){context.HistorialCita.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<HistorialCita?> Puthistorial_cita(HistorialCita value){var item=await context.HistorialCita.FindAsync(value.id_h_cita);if(item==null)return null;item.observaciones_historial=value.observaciones_historial;item.fecha_cambio=value.fecha_cambio;item.id_cita=value.id_cita;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deletehistorial_cita(int id){var item=await context.HistorialCita.FindAsync(id);if(item==null)return false;context.HistorialCita.Remove(item);await context.SaveChangesAsync();return true;}
}
