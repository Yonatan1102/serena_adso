using WebApplication1.models;

namespace WebApplication1.interfaces;

public interface Ificha
{
    Task<List<ficha>> Getficha();
    Task<ficha?> GetfichaById(int id);
    Task<ficha> Postficha(ficha value);
    Task<ficha?> Putficha(ficha value);
    Task<bool> Deleteficha(int id);
}
