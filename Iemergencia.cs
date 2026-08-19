using WebApplication1.models;


namespace WebApplication1.repositories.interfaces
{
    public interface Iemergencia
    {
        Task<List<emergencia>> Getemergencia();
    }
}