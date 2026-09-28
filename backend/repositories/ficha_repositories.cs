using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class ficha_repositories : Ificha
{
    private readonly serena _context;

    public ficha_repositories(serena context)
    {
        _context = context;
    }

    public async Task<List<ficha>> Getficha()
    {
        return await _context.ficha
            .AsNoTracking()
            .Include(x => x.usuario_fichas)
            .ToListAsync();
    }

    public async Task<ficha?> GetfichaById(int id)
    {
        return await _context.ficha
            .AsNoTracking()
            .Include(x => x.usuario_fichas)
            .FirstOrDefaultAsync(x => x.id_ficha == id);
    }

    public async Task<ficha> Postficha(ficha value)
    {
        _context.ficha.Add(value);
        await _context.SaveChangesAsync();
        return value;
    }

    public async Task<ficha?> Putficha(ficha value)
    {
        var item = await _context.ficha.FindAsync(value.id_ficha);
        if (item is null) return null;

        item.codigo_ficha = value.codigo_ficha;
        item.programa = value.programa;
        item.centro = value.centro;
        item.jornada = value.jornada;
        item.estado = value.estado;

        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> Deleteficha(int id)
    {
        var item = await _context.ficha.FindAsync(id);
        if (item is null) return false;

        _context.ficha.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
