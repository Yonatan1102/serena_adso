using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;

namespace WebApplication1.repositories
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

        internal static async Task Gethistorial_cita(historial_cita historial_Cita)
        {
            throw new NotImplementedException();
        }
    }
}


