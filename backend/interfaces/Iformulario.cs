using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Iformulario
    {
        Task<List<formulario>> Getformulario();
        Task<formulario?> GetformularioById(int id);
        Task<formulario> Postformulario(formulario formulario);
        Task<formulario?> Putformulario(formulario formulario);
        Task<bool> Deleteformulario(int id);
    }
}
