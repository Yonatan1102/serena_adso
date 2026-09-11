namespace WebApplication1.interfaces
{
    public interface Iloginservice
    {
        Task<models.usuario?> BuscarPorCorreo(string email);
        Task<models.usuario> Registrar(models.usuario usuario);
        Task<models.usuario?> ValidarCredenciales(string email, string contrasena);
    }
}