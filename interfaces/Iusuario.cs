using WebApplication1.models;



namespace WebApplication1.interfaces
{
    public interface Iusuario
    {
        Task<List<usuario>> Getusuario();

    }
}        

