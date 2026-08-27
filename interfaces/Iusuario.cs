using WebApplication1.models;



namespace WebApplication1.interfaces
{
    public interface Iusuario
    {
        Task<List<usuario>> Getusuario();
        Task<usuario> Postusuario();
        Task<usuario> GetusuarioById(int id);
        Task<usuario> Putusuario(usuario usuario);

    }
}        

