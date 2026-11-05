using WebApplication1.models;

namespace WebApplication1.interfaces
{
    public interface IRol
    {
        Task<List<Rol>> Getrol();
        Task<Rol> Postrol(Rol Cita);
        Task<Rol?> GetrolById(int id);
        Task<Rol?> Putrol(Rol Rol);
        Task<bool> Deleterol(int id);
    }
}
