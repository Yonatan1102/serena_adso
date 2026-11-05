using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class DisponibilidadRepository : IDisponibilidad
{
    private readonly SerenaDbContext _context;

    public DisponibilidadRepository(SerenaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Disponibilidad>> Getdisponibilidad()
    {
        return await _context.Disponibilidad
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Disponibilidad?> GetdisponibilidadById(int id)
    {
        return await _context.Disponibilidad
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.id_disponibilidad == id);
    }

    public async Task<Disponibilidad> Postdisponibilidad(Disponibilidad value)
    {
        _context.Disponibilidad.Add(value);
        await _context.SaveChangesAsync();
        return value;
    }

    public async Task<Disponibilidad?> Putdisponibilidad(Disponibilidad value)
    {
        var item = await _context.Disponibilidad.FindAsync(value.id_disponibilidad);
        if (item is null) return null;

        item.id_usuario = value.id_usuario;
        item.id_rol = value.id_rol;
        item.dia_semana = value.dia_semana;
        item.hora_inicio = value.hora_inicio;
        item.hora_fin = value.hora_fin;
        item.estado = value.estado;

        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> Deletedisponibilidad(int id)
    {
        var item = await _context.Disponibilidad.FindAsync(id);
        if (item is null) return false;

        _context.Disponibilidad.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}