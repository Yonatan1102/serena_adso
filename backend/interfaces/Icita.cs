using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Icita
    {
        Task<List<cita>> Getcita();
        Task<cita> Postcita(cita cita);
        Task<cita?> GetcitaById(int id);
        Task<cita?> Putcita(cita cita);
        Task<bool> Deletecita(int id);
    }
}