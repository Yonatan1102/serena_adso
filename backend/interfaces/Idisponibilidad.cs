using WebApplication1.models;

namespace WebApplication1.interfaces;

public interface IDisponibilidad
{
    Task<List<Disponibilidad>> Getdisponibilidad();
    Task<Disponibilidad?> GetdisponibilidadById(int id);
    Task<Disponibilidad> Postdisponibilidad(Disponibilidad value);
    Task<Disponibilidad?> Putdisponibilidad(Disponibilidad value);
    Task<bool> Deletedisponibilidad(int id);
}