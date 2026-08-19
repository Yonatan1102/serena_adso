using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.historial_cita_repositories
{

    public class historial_cita_repositories : Ihistorial_cita
    {
        private readonly serena context;

        public historial_cita_repositories(serena context)

        {
            this.context = context;
        }
        Task<historial_cita> Ihistorial_cita.Gethistorial_citaById(int id)
        {
            throw new NotImplementedException();
        }

        public Task<historial_cita> Gethistorial_cita(int id)
        {
            throw new NotImplementedException();
        }
        public Task<historial_cita> Posthistorial_cita(historial_cita historial_cita)
        {
            throw new NotImplementedException();
        }
        public Task<historial_cita> Puthistorial_cita(historial_cita historial_cita)
        {
            throw new NotImplementedException();
        }

        public Task<List<historial_cita>> Gethistorial_cita()
        {
            throw new NotImplementedException();
        }
    }
}


