using WebApplication1.models;


namespace WebApplication1.repositories.interfaces
{
    public interface Ipublicaciones
    {
        Task<List<publicaciones>> Getpublicaciones();
        Task<publicaciones> Postpublicaciones(publicaciones publicaiones);
        Task<publicaciones> GetpublicacionesById(int id);
        Task<publicaciones> Putpublicaciones(publicaciones publicaiones);
    }
}