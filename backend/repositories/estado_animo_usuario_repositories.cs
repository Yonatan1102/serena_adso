using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class estado_animo_usuario_repositories : Iestado_animo_usuario
{
    private readonly serena context;

    public estado_animo_usuario_repositories(serena context)
    {
        this.context = context;
    }

    public Task<List<estado_animo_usuario>> Getestado_animo_usuario() =>
        context.estado_animo_usuario
            .AsNoTracking()
            .Include(x => x.estado_de_animo)
            .Include(x => x.usuario)
            .ToListAsync();

    public Task<List<estado_animo_usuario>> Getestado_animo_usuarioPorUsuario(int idUsuario) =>
        context.estado_animo_usuario
            .AsNoTracking()
            .Where(x => x.id_usuario == idUsuario)
            .Include(x => x.estado_de_animo)
            .OrderByDescending(x => x.fecha_estado)
            .ToListAsync();

    public Task<estado_animo_usuario?> Getestado_animo_usuarioById(int id) =>
        context.estado_animo_usuario
            .Include(x => x.estado_de_animo)
            .Include(x => x.usuario)
            .FirstOrDefaultAsync(x => x.id_estado_usuario == id);

    public async Task<estado_animo_usuario> Postestado_animo_usuario(estado_animo_usuario value)
    {
        var estadoExiste = await context.estado_de_animo.FindAsync(value.id_estado);
        if (estadoExiste == null)
            throw new InvalidOperationException("El estado de ánimo indicado no existe.");

        var usuarioExiste = await context.usuario.FindAsync(value.id_usuario);
        if (usuarioExiste == null)
            throw new InvalidOperationException("El usuario indicado no existe.");

        context.estado_animo_usuario.Add(value);
        await context.SaveChangesAsync();
        return value;
    }

    public async Task<estado_animo_usuario?> Putestado_animo_usuario(estado_animo_usuario value)
    {
        var item = await context.estado_animo_usuario.FindAsync(value.id_estado_usuario);
        if (item == null) return null;

        item.id_estado = value.id_estado;
        item.id_usuario = value.id_usuario;
        item.fecha_estado = value.fecha_estado;
        item.motivo = value.motivo;

        await context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> Deleteestado_animo_usuario(int id)
    {
        var item = await context.estado_animo_usuario.FindAsync(id);
        if (item == null) return false;

        context.estado_animo_usuario.Remove(item);
        await context.SaveChangesAsync();
        return true;
    }
}
