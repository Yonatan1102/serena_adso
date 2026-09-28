using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class disponibilidad_Repositories : Idisponibilidad
{
    private readonly serena _context;

    public disponibilidad_Repositories(serena context)
    {
        _context = context;
    }

    public async Task<List<disponibilidad>> Getdisponibilidad()
    {
        return await _context.disponibilidad
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<disponibilidad?> GetdisponibilidadById(int id)
    {
        return await _context.disponibilidad
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.id_disponibilidad == id);
    }

    public async Task<disponibilidad> Postdisponibilidad(disponibilidad value)
    {
        _context.disponibilidad.Add(value);
        await _context.SaveChangesAsync();
        return value;
    }

    public async Task<disponibilidad?> Putdisponibilidad(disponibilidad value)
    {
        var item = await _context.disponibilidad.FindAsync(value.id_disponibilidad);
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
        var item = await _context.disponibilidad.FindAsync(id);
        if (item is null) return false;

        _context.disponibilidad.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}