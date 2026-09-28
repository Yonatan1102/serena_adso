using WebApplication1.models;



namespace WebApplication1.interfaces
{
    public interface Iusuario
    {
        Task<List<usuario>> Getusuario();
        Task<usuario?> GetusuarioById(int id);
        Task<usuario> Postusuario(usuario usuario);
        Task<usuario?> Putusuario(usuario usuario);
        Task<bool> Deleteusuario(int id);
        Task<usuario?> BuscarPorCorreo(string email);
        Task<usuario?> ValidarCredenciales(string email, string contrasena);

    }
}        

