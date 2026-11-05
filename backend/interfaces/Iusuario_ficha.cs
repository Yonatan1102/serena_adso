using WebApplication1.models;

namespace WebApplication1.interfaces;

public interface IUsuarioFicha
{
    Task<List<UsuarioFicha>> Getusuario_ficha();
    Task<UsuarioFicha?> Getusuario_fichaById(int id);
    Task<UsuarioFicha> Postusuario_ficha(UsuarioFicha value);
    Task<UsuarioFicha?> Putusuario_ficha(UsuarioFicha value);
    Task<bool> Deleteusuario_ficha(int id);
}
