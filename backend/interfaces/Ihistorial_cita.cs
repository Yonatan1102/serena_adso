using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IHistorialCita
    {
        Task<List<HistorialCita>> Gethistorial_cita();
        Task<HistorialCita?> Gethistorial_citaById(int id);
        Task<HistorialCita> Posthistorial_cita(HistorialCita HistorialCita);
        Task<HistorialCita?> Puthistorial_cita(HistorialCita HistorialCita);
        Task<bool> Deletehistorial_cita(int id);
    }
}