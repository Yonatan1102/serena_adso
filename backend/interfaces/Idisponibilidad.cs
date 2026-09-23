using WebApplication1.models;

namespace WebApplication1.interfaces;

public interface Idisponibilidad
{
    Task<List<Idisponibilidad>> Getdisponibilidad();
    Task<disponibilidad?> GetdisponibilidadById(int id);
    Task<disponibilidad> Postdisponibilidad(disponibilidad value);
    Task<disponibilidad?> Putdisponibilidad(disponibilidad value);
    Task<bool> Deletedisponibilidad(int id);
}