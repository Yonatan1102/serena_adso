using WebApplication1.models;

namespace WebApplication1.interfaces
{
    public interface Irol
    {
        Task<List<rol>> Getrol();
        Task<rol> Postrol(rol cita);
        Task<rol?> GetrolById(int id);
        Task<rol?> Putrol(rol rol);
        Task<bool> Deleterol(int id);
    }
}
