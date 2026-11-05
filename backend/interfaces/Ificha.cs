using WebApplication1.models;

namespace WebApplication1.interfaces;

public interface IFicha
{
    Task<List<Ficha>> Getficha();
    Task<Ficha?> GetfichaById(int id);
    Task<Ficha> Postficha(Ficha value);
    Task<Ficha?> Putficha(Ficha value);
    Task<bool> Deleteficha(int id);
}
