using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class FichaRepository : IFicha
{
    private readonly SerenaDbContext _context;

    public FichaRepository(SerenaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Ficha>> Getficha()
    {
        return await _context.Ficha
            .AsNoTracking()
            .Include(x => x.usuario_fichas)
            .ToListAsync();
    }

    public async Task<Ficha?> GetfichaById(int id)
    {
        return await _context.Ficha
            .AsNoTracking()
            .Include(x => x.usuario_fichas)
            .FirstOrDefaultAsync(x => x.id_ficha == id);
    }

    public async Task<Ficha> Postficha(Ficha value)
    {
        _context.Ficha.Add(value);
        await _context.SaveChangesAsync();
        return value;
    }

    public async Task<Ficha?> Putficha(Ficha value)
    {
        var item = await _context.Ficha.FindAsync(value.id_ficha);
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
        var item = await _context.Ficha.FindAsync(id);
        if (item is null) return false;

        _context.Ficha.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
