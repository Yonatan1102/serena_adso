using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class formulario_repositories : Iformulario
{
    private readonly serena context;
    public formulario_repositories(serena context)=>this.context=context;
    public Task<List<formulario>> Getformulario()=>context.formulario.AsNoTracking().ToListAsync();
    public Task<formulario?> GetformularioById(int id)=>context.formulario.FindAsync(id).AsTask();
    public async Task<formulario> Postformulario(formulario value){context.formulario.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<formulario?> Putformulario(formulario value){var item=await context.formulario.FindAsync(value.id_formulario);if(item==null)return null;item.nombre_formulario=value.nombre_formulario;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deleteformulario(int id){var item=await context.formulario.FindAsync(id);if(item==null)return false;context.formulario.Remove(item);await context.SaveChangesAsync();return true;}
}
