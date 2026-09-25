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
    public Task<diario?> GetdiarioByUsuario(int id_usuario)=>context.diario.AsNoTracking().FirstOrDefaultAsync(x=>x.id_usuario==id_usuario);
    public async Task<diario> Postdiario(diario value){context.diario.Add(value);await context.SaveChangesAsync();return value;}

    public async Task<diario> UpsertDiario(diario value)
    {
        var item = await context.diario.FirstOrDefaultAsync(x => x.id_usuario == value.id_usuario);
        if (item == null)
        {
            item = new diario
            {
                id_usuario = value.id_usuario,
                fecha_apertura = value.fecha_apertura == default ? DateTime.Now : value.fecha_apertura,
                compartir_sp = value.compartir_sp,
                contenido = value.contenido ?? string.Empty,
            };
            context.diario.Add(item);
        }
        else
        {
            var marca = $"\n\n--- Actualización {DateTime.Now:yyyy-MM-dd HH:mm} ---\n";
            item.contenido = string.IsNullOrWhiteSpace(item.contenido)
                ? (value.contenido ?? string.Empty)
                : item.contenido + marca + (value.contenido ?? string.Empty);
            item.compartir_sp = value.compartir_sp;
        }
        await context.SaveChangesAsync();
        return item;
    }

    public async Task<diario?> Putdiario(diario value){var item=await context.diario.FindAsync(value.id_diario);if(item==null)return null;item.contenido=value.contenido;item.compartir_sp=value.compartir_sp;item.fecha_apertura=value.fecha_apertura;item.id_usuario=value.id_usuario;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deletediario(int id){var item=await context.diario.FindAsync(id);if(item==null)return false;context.diario.Remove(item);await context.SaveChangesAsync();return true;}
}
