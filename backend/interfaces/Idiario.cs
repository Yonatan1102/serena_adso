using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Idiario
    {
        Task<List<diario>> Getdiario();
        Task<diario> Postdiario(diario diario);
        Task<diario?> GetdiarioById(int id);
        Task<diario?> GetdiarioByUsuario(int id_usuario);
        Task<diario> UpsertDiario(diario diario);
        Task<diario?> Putdiario(diario diario);
        Task<bool> Deletediario(int id);
    }
}