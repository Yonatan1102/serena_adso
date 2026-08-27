using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class historial_cita_repositories : Ihistorial_cita
{
    private readonly serena context;
    public historial_cita_repositories(serena context)=>this.context=context;
    public Task<List<historial_cita>> Gethistorial_cita()=>context.historial_cita.AsNoTracking().ToListAsync();
    public Task<historial_cita?> Gethistorial_citaById(int id)=>context.historial_cita.FindAsync(id).AsTask();
    public async Task<historial_cita> Posthistorial_cita(historial_cita value){context.historial_cita.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<historial_cita?> Puthistorial_cita(historial_cita value){var item=await context.historial_cita.FindAsync(value.id_h_cita);if(item==null)return null;item.observaciones_historial=value.observaciones_historial;item.fecha_cambio=value.fecha_cambio;await context.SaveChangesAsync();return item;}
}
