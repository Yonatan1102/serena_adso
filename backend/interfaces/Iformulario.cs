using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IFormulario
    {
        Task<List<Formulario>> Getformulario();
        Task<Formulario?> GetformularioById(int id);
        Task<Formulario> Postformulario(Formulario Formulario);
        Task<Formulario?> Putformulario(Formulario Formulario);
        Task<bool> Deleteformulario(int id);
    }
}
