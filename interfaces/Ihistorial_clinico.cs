using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Ihistorial_clinico
    {
        Task<List<historial_clinico>> Gethistorial_clinico();
        Task<historial_clinico> Gethistorial_clinicoById(int id);
        Task<historial_clinico> Posthistorial_clinico(historial_clinico historial_clinico);
        Task<historial_clinico> Puthistorial_clinico(historial_clinico historial_clinico);
    }
}