using WebApplication1.models;


namespace WebApplication1.repositories.interfaces
{
    public interface Idiario
    {
        Task<List<diario>> Getdiario();
        Task<diario> Postdiario(diario diario);
        Task<diario> GetdiarioById(int id);
        Task<diario> Putdiario(diario diario);
    }
}