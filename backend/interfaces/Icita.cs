using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface ICita
    {
        Task<List<Cita>> Getcita();
        Task<Cita> Postcita(Cita Cita);
        Task<Cita?> GetcitaById(int id);
        Task<Cita?> Putcita(Cita Cita);
        Task<bool> Deletecita(int id);
    }
}