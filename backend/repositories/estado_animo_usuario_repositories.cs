using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class EstadoAnimoUsuarioRepository : IEstadoAnimoUsuario
{
    private readonly SerenaDbContext context;

    public EstadoAnimoUsuarioRepository(SerenaDbContext context)
    {
        this.context = context;
    }

    public Task<List<EstadoAnimoUsuario>> Getestado_animo_usuario() =>
        context.EstadoAnimoUsuario
            .AsNoTracking()
            .Include(x => x.EstadoDeAnimo)
            .Include(x => x.Usuario)
            .ToListAsync();

    public Task<List<EstadoAnimoUsuario>> Getestado_animo_usuarioPorUsuario(int idUsuario) =>
        context.EstadoAnimoUsuario
            .AsNoTracking()
            .Where(x => x.id_usuario == idUsuario)
            .Include(x => x.EstadoDeAnimo)
            .OrderByDescending(x => x.fecha_estado)
            .ToListAsync();

    public Task<EstadoAnimoUsuario?> Getestado_animo_usuarioById(int id) =>
        context.EstadoAnimoUsuario
            .Include(x => x.EstadoDeAnimo)
            .Include(x => x.Usuario)
            .FirstOrDefaultAsync(x => x.id_estado_usuario == id);

    public async Task<EstadoAnimoUsuario> Postestado_animo_usuario(EstadoAnimoUsuario value)
    {
        var estadoExiste = await context.EstadoDeAnimo.FindAsync(value.id_estado);
        if (estadoExiste == null)
            throw new InvalidOperationException("El estado de ánimo indicado no existe.");

        var usuarioExiste = await context.Usuario.FindAsync(value.id_usuario);
        if (usuarioExiste == null)
            throw new InvalidOperationException("El Usuario indicado no existe.");

        value.EstadoDeAnimo = estadoExiste;
        value.Usuario = usuarioExiste;
        context.EstadoAnimoUsuario.Add(value);
        await context.SaveChangesAsync();
        return value;
    }

    public async Task<EstadoAnimoUsuario?> Putestado_animo_usuario(EstadoAnimoUsuario value)
    {
        var item = await context.EstadoAnimoUsuario.FindAsync(value.id_estado_usuario);
        if (item == null) return null;

        item.id_estado = value.id_estado;
        item.id_usuario = value.id_usuario;
        item.fecha_estado = value.fecha_estado;
        item.motivo = value.motivo;
        item.EstadoDeAnimo = await context.EstadoDeAnimo.FindAsync(value.id_estado)
            ?? throw new InvalidOperationException("El estado de ánimo indicado no existe.");

        await context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> Deleteestado_animo_usuario(int id)
    {
        var item = await context.EstadoAnimoUsuario.FindAsync(id);
        if (item == null) return false;

        context.EstadoAnimoUsuario.Remove(item);
        await context.SaveChangesAsync();
        return true;
    }
}
