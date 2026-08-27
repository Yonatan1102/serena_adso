using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class historial_clinico_repositories : Ihistorial_clinico
{
    private readonly serena context;
    public historial_clinico_repositories(serena context)=>this.context=context;
    public Task<List<historial_clinico>> Gethistorial_clinico()=>context.historial_clinico.AsNoTracking().ToListAsync();
    public Task<historial_clinico?> Gethistorial_clinicoById(int id)=>context.historial_clinico.FindAsync(id).AsTask();
    public async Task<historial_clinico> Posthistorial_clinico(historial_clinico value){context.historial_clinico.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<historial_clinico?> Puthistorial_clinico(historial_clinico value){var item=await context.historial_clinico.FindAsync(value.id_h_clinico);if(item==null)return null;item.condiciones=value.condiciones;item.antecedentes=value.antecedentes;await context.SaveChangesAsync();return item;}
}
