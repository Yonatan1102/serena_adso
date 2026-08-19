using WebApplication1.models;


namespace WebApplication1.repositories.interfaces
{
    public interface Ihistorial_cita
    {
        Task<List<historial_cita>> Gethistorial_cita();
        Task<historial_cita> Gethistorial_citaById(int id);
        Task<historial_cita> Posthistorial_cita(historial_cita historial_cita);
        Task<historial_cita> Puthistorial_cita(historial_cita historial_cita);
    }
}