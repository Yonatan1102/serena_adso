using WebApplication1.models;


namespace WebApplication1.repositories.interfaces
{
    public interface Icita
    {
        Task<List<cita>> Getcita();
        Task<cita> Postcita(cita cita);
        Task<cita> GetcitaById(int id);
        Task<cita> Putcita(cita cita);
    }
}