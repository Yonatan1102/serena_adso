using Microsoft.AspNetCore.Mvc;
using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Iestado_de_animo
    {
        Task<List<estado_de_animo>> Getestado_de_animo();
        Task<estado_de_animo> Postestado_de_animo(estado_de_animo estado_de_animo);
        Task<estado_de_animo?> Getestado_de_animoById(int id);
        Task<estado_de_animo?> Putestado_de_animo(estado_de_animo estado_de_animo);
    }
}
