using WebApplication1.models;



namespace WebApplication1.interfaces
{
    public interface IUsuario
    {
        Task<List<Usuario>> Getusuario();
        Task<Usuario?> GetusuarioById(int id);
        Task<Usuario> Postusuario(Usuario Usuario);
        Task<Usuario?> Putusuario(Usuario Usuario);
        Task<bool> Deleteusuario(int id);
        Task<Usuario?> BuscarPorCorreo(string email);
        Task<Usuario?> ValidarCredenciales(string email, string contrasena);

    }
}        

