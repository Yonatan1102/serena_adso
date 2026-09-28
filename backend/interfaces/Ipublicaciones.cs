using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Ipublicaciones
    {
        Task<List<publicaciones>> Getpublicaciones();
        Task<publicaciones> Postpublicaciones(publicaciones publicaiones);
        Task<publicaciones?> GetpublicacionesById(int id);
        Task<publicaciones?> Putpublicaciones(publicaciones publicaiones);
        Task<bool> Deletepublicaciones(int id);
    }
}