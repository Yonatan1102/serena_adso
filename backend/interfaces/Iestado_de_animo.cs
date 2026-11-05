using Microsoft.AspNetCore.Mvc;
using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IEstadoDeAnimo
    {
        Task<List<EstadoDeAnimo>> Getestado_de_animo();
        Task<EstadoDeAnimo> Postestado_de_animo(EstadoDeAnimo EstadoDeAnimo);
        Task<EstadoDeAnimo?> Getestado_de_animoById(int id);
        Task<EstadoDeAnimo?> Putestado_de_animo(EstadoDeAnimo EstadoDeAnimo);
        Task<bool> Deleteestado_de_animo(int id);
    }
}
