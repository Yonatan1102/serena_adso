using WebApplication1.models;



namespace WebApplication1.repositories.interfaces
{
    public interface Iusuario
    {
        Task<List<usuario>> Getusuario();

    }
}        

