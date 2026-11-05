using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IPublicaciones
    {
        Task<List<Publicaciones>> Getpublicaciones();
        Task<Publicaciones> Postpublicaciones(Publicaciones publicaiones);
        Task<Publicaciones?> GetpublicacionesById(int id);
        Task<Publicaciones?> Putpublicaciones(Publicaciones publicaiones);
        Task<bool> Deletepublicaciones(int id);
    }
}