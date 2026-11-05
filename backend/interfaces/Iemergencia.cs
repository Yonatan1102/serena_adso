using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IEmergencia
    {
        Task<List<Emergencia>> Getemergencia();
        Task<Emergencia?> GetemergenciaById(int id);
        Task<Emergencia> Postemergencia(Emergencia Emergencia);
        Task<Emergencia?> Putemergencia(Emergencia Emergencia);
        Task<bool> Deleteemergencia(int id);
    }
}