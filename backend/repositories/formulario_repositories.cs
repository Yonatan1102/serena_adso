using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class FormularioRepository : IFormulario
{
    private readonly SerenaDbContext context;
    public FormularioRepository(SerenaDbContext context)=>this.context=context;
    public Task<List<Formulario>> Getformulario()=>context.Formulario.AsNoTracking().ToListAsync();
    public Task<Formulario?> GetformularioById(int id)=>context.Formulario.FindAsync(id).AsTask();
    public async Task<Formulario> Postformulario(Formulario value){context.Formulario.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<Formulario?> Putformulario(Formulario value){var item=await context.Formulario.FindAsync(value.id_formulario);if(item==null)return null;item.nombre_formulario=value.nombre_formulario;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deleteformulario(int id){var item=await context.Formulario.FindAsync(id);if(item==null)return false;context.Formulario.Remove(item);await context.SaveChangesAsync();return true;}
}
