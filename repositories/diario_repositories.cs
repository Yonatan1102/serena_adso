using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class diario_repositories : Idiario
{
    private readonly serena context;
    public diario_repositories(serena context) => this.context=context;
    public Task<List<diario>> Getdiario()=>context.diario.AsNoTracking().ToListAsync();
    public Task<diario?> GetdiarioById(int id)=>context.diario.FirstOrDefaultAsync(x=>x.id_diario==id);
    public async Task<diario> Postdiario(diario value){context.diario.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<diario?> Putdiario(diario value){var item=await context.diario.FindAsync(value.id_diario);if(item==null)return null;item.contenido=value.contenido;item.compartir_sp=value.compartir_sp;await context.SaveChangesAsync();return item;}
}
