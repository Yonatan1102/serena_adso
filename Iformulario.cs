using WebApplication1.models;


namespace WebApplication1.repositories.interfaces
{
    public interface Iformulario
    {
        Task<List<formulario>> Getformulario();
    }
}
