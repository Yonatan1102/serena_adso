using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class DiarioRepository : IDiario
{
    private readonly SerenaDbContext context;
    public DiarioRepository(SerenaDbContext context) => this.context=context;
    public Task<List<Diario>> Getdiario()=>context.Diario.AsNoTracking().ToListAsync();
    public Task<Diario?> GetdiarioById(int id)=>context.Diario.FirstOrDefaultAsync(x=>x.id_diario==id);
    public Task<Diario?> GetdiarioByUsuario(int id_usuario)=>context.Diario.AsNoTracking().FirstOrDefaultAsync(x=>x.id_usuario==id_usuario);
    public async Task<Diario> Postdiario(Diario value){context.Diario.Add(value);await context.SaveChangesAsync();return value;}

    public async Task<Diario> UpsertDiario(Diario value)
    {
        var item = await context.Diario.FirstOrDefaultAsync(x => x.id_usuario == value.id_usuario);
        if (item == null)
        {
            item = new Diario
            {
                id_usuario = value.id_usuario,
                fecha_apertura = value.fecha_apertura == default ? DateTime.Now : value.fecha_apertura,
                compartir_sp = value.compartir_sp,
                contenido = value.contenido ?? string.Empty,
            };
            context.Diario.Add(item);
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

    public async Task<Diario?> Putdiario(Diario value){var item=await context.Diario.FindAsync(value.id_diario);if(item==null)return null;item.contenido=value.contenido;item.compartir_sp=value.compartir_sp;item.fecha_apertura=value.fecha_apertura;item.id_usuario=value.id_usuario;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deletediario(int id){var item=await context.Diario.FindAsync(id);if(item==null)return false;context.Diario.Remove(item);await context.SaveChangesAsync();return true;}
}
