using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Iemergencia
    {
        Task<List<emergencia>> Getemergencia();
    }
}