using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class UsuarioFichaRepository : IUsuarioFicha
{
    private readonly SerenaDbContext _context;

    public UsuarioFichaRepository(SerenaDbContext context)
    {
        _context = context;
    }

    public async Task<List<UsuarioFicha>> Getusuario_ficha()
    {
        return await _context.UsuarioFicha
            .AsNoTracking()
            .Include(x => x.Usuario)
            .Include(x => x.Ficha)
            .ToListAsync();
    }

    public async Task<UsuarioFicha?> Getusuario_fichaById(int id)
    {
        return await _context.UsuarioFicha
            .AsNoTracking()
            .Include(x => x.Usuario)
            .Include(x => x.Ficha)
            .FirstOrDefaultAsync(x => x.id_usuario_ficha == id);
    }

    public async Task<UsuarioFicha> Postusuario_ficha(UsuarioFicha value)
    {
        _context.UsuarioFicha.Add(value);
        await _context.SaveChangesAsync();
        return value;
    }

    public async Task<UsuarioFicha?> Putusuario_ficha(UsuarioFicha value)
    {
        var item = await _context.UsuarioFicha.FindAsync(value.id_usuario_ficha);
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
        var item = await _context.UsuarioFicha.FindAsync(id);
        if (item is null) return false;

        _context.UsuarioFicha.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
