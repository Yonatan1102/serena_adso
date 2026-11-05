using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;
namespace WebApplication1.repositories;
public class PublicacionesRepository : IPublicaciones
{
    private readonly SerenaDbContext context;
    public PublicacionesRepository(SerenaDbContext context)=>this.context=context;
    public Task<List<Publicaciones>> Getpublicaciones() =>
        context.Publicaciones
            .AsNoTracking()
            .Select(p => new Publicaciones
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

    public Task<Publicaciones?> GetpublicacionesById(int id) =>
        context.Publicaciones
            .AsNoTracking()
            .Where(p => p.id_publicaciones == id)
            .Select(p => new Publicaciones
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
    public async Task<Publicaciones> Postpublicaciones(Publicaciones value){context.Publicaciones.Add(value);await context.SaveChangesAsync();return value;}
    public async Task<Publicaciones?> Putpublicaciones(Publicaciones value){var item=await context.Publicaciones.FindAsync(value.id_publicaciones);if(item==null)return null;item.titulo=value.titulo;item.contenido=value.contenido;item.id_comunidad=value.id_comunidad;item.etiqueta=value.etiqueta;item.votos=value.votos;item.comentarios_count=value.comentarios_count;item.imagen_url=value.imagen_url;await context.SaveChangesAsync();return item;}
    public async Task<bool> Deletepublicaciones(int id){var item=await context.Publicaciones.FindAsync(id);if(item==null)return false;context.Publicaciones.Remove(item);await context.SaveChangesAsync();return true;}
}
