using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
namespace WebApplication1.historial_clinico_repositories
{

    public class historial_clinico_repositories : Ihistorial_clinico
    {
        private readonly serena context;

        public historial_clinico_repositories(serena context)

        {
            this.context = context;
        }

        Task<historial_clinico> Ihistorial_clinico.Gethistorial_clinicoById(int id)
        {
            throw new NotImplementedException();
        }

        public Task<historial_clinico> Gethistorial_clinico(int id)
        {
            throw new NotImplementedException();
        }
        public Task<historial_clinico> Posthistorial_clinico(historial_clinico historial_clinico)
        {
            throw new NotImplementedException();
        }
        public Task<historial_clinico> Puthistorial_clinico(historial_clinico historial_clinico)
        {
            throw new NotImplementedException();
        }

        public Task<List<historial_clinico>> Gethistorial_clinico()
        {
            throw new NotImplementedException();
        }
    }
}




