using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IDiario
    {
        Task<List<Diario>> Getdiario();
        Task<Diario> Postdiario(Diario Diario);
        Task<Diario?> GetdiarioById(int id);
        Task<Diario?> GetdiarioByUsuario(int id_usuario);
        Task<Diario> UpsertDiario(Diario Diario);
        Task<Diario?> Putdiario(Diario Diario);
        Task<bool> Deletediario(int id);
    }
}