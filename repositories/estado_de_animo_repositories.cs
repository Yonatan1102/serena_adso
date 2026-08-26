using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;


namespace WebApplication1.repositories
{

    public class estado_de_animo_repositories : Iestado_de_animo
    {
        private readonly serena context;

        public estado_de_animo_repositories(serena context)

        {
            this.context = context;
        }

        Task<List<estado_de_animo>> Iestado_de_animo.Getestado_de_animo()
        {
            throw new NotImplementedException();
        }

        Task<estado_de_animo> Iestado_de_animo.Postestado_de_animo(estado_de_animo estado_de_animo)
        {
            throw new NotImplementedException();
        }

        Task<estado_de_animo> Iestado_de_animo.Getestado_de_animoById(int id)
        {
            throw new NotImplementedException();
        }

        Task<estado_de_animo> Iestado_de_animo.Putestado_de_animo(estado_de_animo estado_de_animo)
        {
            throw new NotImplementedException();
        }

        internal  Task Postestado_de_animo(Func<estado_de_animo, Task<IActionResult>> estado_de_animo)
        {
            throw new NotImplementedException();
        }

        internal Task Putestado_de_animo(estado_de_animo estado_de_animo)
        {
            throw new NotImplementedException();
        }
    }
}

    


