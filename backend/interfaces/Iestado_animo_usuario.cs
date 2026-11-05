using WebApplication1.models;

namespace WebApplication1.interfaces
{
    public interface IEstadoAnimoUsuario
    {
        Task<List<EstadoAnimoUsuario>> Getestado_animo_usuario();
        Task<List<EstadoAnimoUsuario>> Getestado_animo_usuarioPorUsuario(int idUsuario);
        Task<EstadoAnimoUsuario?> Getestado_animo_usuarioById(int id);
        Task<EstadoAnimoUsuario> Postestado_animo_usuario(EstadoAnimoUsuario value);
        Task<EstadoAnimoUsuario?> Putestado_animo_usuario(EstadoAnimoUsuario value);
        Task<bool> Deleteestado_animo_usuario(int id);
    }
}
