namespace WebApplication1.interfaces
{
    public interface ILoginService
    {
        Task<models.Usuario?> BuscarPorCorreo(string email);
        Task<models.Usuario> Registrar(models.Usuario Usuario);
        Task<models.Usuario?> ValidarCredenciales(string email, string contrasena);
        Task<bool> CambiarContrasena(string email, string contrasenaActual, string nuevaContrasena);
    }
}