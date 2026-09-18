using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class publicaciones_repositories : Ipublicaciones
{
    private readonly serena context;
    public publicaciones_repositories(serena context)=>this.context=context;
    public Task<List<publicaciones>> Getpublicaciones() =>
        context.publicaciones
            .AsNoTracking()
            .Select(p => new publicaciones
            {
                id_publicaciones = p.id_publicaciones,
                titulo = p.titulo,
                contenido = p.contenido,
                fecha_publicacion = p.fecha_publicacion,
                id_usuario = p.id_usuario,
                id_comunidad = p.id_comunidad,
                etiqueta = p.etiqueta,
                votos = p.votos,
                comentarios_count = p.comentarios_count,
                imagen_url = p.imagen_url != null && p.imagen_url.Length <= 2_800_000 ? p.imagen_url : null,
            })
            .ToListAsync();

    public Task<publicaciones?> GetpublicacionesById(int id) =>
        context.publicaciones
            .AsNoTracking()
            .Where(p => p.id_publicaciones == id)
            .Select(p => new publicaciones
            {
                id_publicaciones = p.id_publicaciones,
                titulo = p.titulo,
                contenido = p.contenido,
                fecha_publicacion = p.fecha_publicacion,
                id_usuario = p.id_usuario,
                id_comunidad = p.id_comunidad,
                etiqueta = p.etiqueta,
                votos = p.votos,
                comentarios_count = p.comentarios_count,
                imagen_url = p.imagen_url != null && p.imagen_url.Length <= 2_800_000 ? p.imagen_url : null,
            })
            .FirstOrDefaultAsync();
    public async Task<publicaciones> Postpublicaciones(publicaciones value){context.publicaciones.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<publicaciones?> Putpublicaciones(publicaciones value){var item=await context.publicaciones.FindAsync(value.id_publicaciones);if(item==null)return null;item.titulo=value.titulo;item.contenido=value.contenido;item.id_comunidad=value.id_comunidad;item.etiqueta=value.etiqueta;item.votos=value.votos;item.comentarios_count=value.comentarios_count;item.imagen_url=value.imagen_url;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deletepublicaciones(int id){var item=await context.publicaciones.FindAsync(id);if(item==null)return false;context.publicaciones.Remove(item);await context.SaveChangesAsync();return true;}
}
