using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Iemergencia
    {
        Task<List<emergencia>> Getemergencia();
        Task<emergencia?> GetemergenciaById(int id);
        Task<emergencia> Postemergencia(emergencia emergencia);
        Task<emergencia?> Putemergencia(emergencia emergencia);
        Task<bool> Deleteemergencia(int id);
    }
}