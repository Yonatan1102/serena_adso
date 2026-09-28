using WebApplication1.models;

namespace WebApplication1.interfaces
{
    public interface Iestado_animo_usuario
    {
        Task<List<estado_animo_usuario>> Getestado_animo_usuario();
        Task<List<estado_animo_usuario>> Getestado_animo_usuarioPorUsuario(int idUsuario);
        Task<estado_animo_usuario?> Getestado_animo_usuarioById(int id);
        Task<estado_animo_usuario> Postestado_animo_usuario(estado_animo_usuario value);
        Task<estado_animo_usuario?> Putestado_animo_usuario(estado_animo_usuario value);
        Task<bool> Deleteestado_animo_usuario(int id);
    }
}
