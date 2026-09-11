using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class cita_repositories : Icita
{
    private readonly serena context;
    public cita_repositories(serena context) => this.context = context;
    public Task<List<cita>> Getcita() => context.cita.AsNoTracking().ToListAsync();
    public Task<cita?> GetcitaById(int id) => context.cita.FirstOrDefaultAsync(x => x.id_cita == id);
    public async Task<cita> Postcita(cita value) { context.cita.Add(value); await context.SaveChangesAsync(); return value; }
    public async Task<cita?> Putcita(cita value) { var item = await context.cita.FindAsync(value.id_cita); if (item == null) return null; item.fecha_hora=value.fecha_hora; item.motivo=value.motivo; item.estado_cita=value.estado_cita; item.id_usuario_aprendiz=value.id_usuario_aprendiz; item.id_usuario_psicologo=value.id_usuario_psicologo; await context.SaveChangesAsync(); return item; }
    public async Task<bool> Deletecita(int id) { var item=await context.cita.FindAsync(id); if(item==null)return false; item.estado_cita="cancelada"; await context.SaveChangesAsync(); return true; }
}
