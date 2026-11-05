using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IHistorialClinico
    {
        Task<List<HistorialClinico>> Gethistorial_clinico();
        Task<HistorialClinico?> Gethistorial_clinicoById(int id);
        Task<HistorialClinico> Posthistorial_clinico(HistorialClinico HistorialClinico);
        Task<HistorialClinico?> Puthistorial_clinico(HistorialClinico HistorialClinico);
        Task<bool> Deletehistorial_clinico(int id);
    }
}