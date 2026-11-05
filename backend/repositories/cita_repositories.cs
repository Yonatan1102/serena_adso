using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class CitaRepository : ICita
{
    private readonly SerenaDbContext context;
    public CitaRepository(SerenaDbContext context) => this.context = context;
    public Task<List<Cita>> Getcita() => context.Cita.AsNoTracking().ToListAsync();
    public Task<Cita?> GetcitaById(int id) => context.Cita.FirstOrDefaultAsync(x => x.id_cita == id);
    public async Task<Cita> Postcita(Cita value) { context.Cita.Add(value); await context.SaveChangesAsync(); return value; }
    public async Task<Cita?> Putcita(Cita value) { var item = await context.Cita.FindAsync(value.id_cita); if (item == null) return null; item.fecha_hora=value.fecha_hora; item.motivo=value.motivo; item.estado_cita=value.estado_cita; item.id_usuario_aprendiz=value.id_usuario_aprendiz; item.id_usuario_psicologo=value.id_usuario_psicologo; await context.SaveChangesAsync(); return item; }
    public async Task<bool> Deletecita(int id) { var item=await context.Cita.FindAsync(id); if(item==null)return false; item.estado_cita="Cancelada"; await context.SaveChangesAsync(); return true; }
}
