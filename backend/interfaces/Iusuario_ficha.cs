using WebApplication1.models;

namespace WebApplication1.interfaces;

public interface Iusuario_ficha
{
    Task<List<usuario_ficha>> Getusuario_ficha();
    Task<usuario_ficha?> Getusuario_fichaById(int id);
    Task<usuario_ficha> Postusuario_ficha(usuario_ficha value);
    Task<usuario_ficha?> Putusuario_ficha(usuario_ficha value);
    Task<bool> Deleteusuario_ficha(int id);
}
