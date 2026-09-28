using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class usuario_ficha_repositories : Iusuario_ficha
{
    private readonly serena _context;

    public usuario_ficha_repositories(serena context)
    {
        _context = context;
    }

    public async Task<List<usuario_ficha>> Getusuario_ficha()
    {
        return await _context.usuario_ficha
            .AsNoTracking()
            .Include(x => x.usuario)
            .Include(x => x.ficha)
            .ToListAsync();
    }

    public async Task<usuario_ficha?> Getusuario_fichaById(int id)
    {
        return await _context.usuario_ficha
            .AsNoTracking()
            .Include(x => x.usuario)
            .Include(x => x.ficha)
            .FirstOrDefaultAsync(x => x.id_usuario_ficha == id);
    }

    public async Task<usuario_ficha> Postusuario_ficha(usuario_ficha value)
    {
        _context.usuario_ficha.Add(value);
        await _context.SaveChangesAsync();
        return value;
    }

    public async Task<usuario_ficha?> Putusuario_ficha(usuario_ficha value)
    {
        var item = await _context.usuario_ficha.FindAsync(value.id_usuario_ficha);
        if (item is null) return null;

        item.id_usuario = value.id_usuario;
        item.id_ficha = value.id_ficha;
        item.fecha_asignacion = value.fecha_asignacion;
        item.estado = value.estado;

        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> Deleteusuario_ficha(int id)
    {
        var item = await _context.usuario_ficha.FindAsync(id);
        if (item is null) return false;

        _context.usuario_ficha.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
