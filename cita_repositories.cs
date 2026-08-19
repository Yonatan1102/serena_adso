using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.cita_repositories
{

    public class cita_repositories : Icita
    {
        private readonly serena context;

        public cita_repositories(serena context)

        {
            this.context = context;
        }

        public async Task<List<cita>> Getcita()
        {
            var data = await context.cita.ToListAsync();
            return data;
        }
        public Task<cita> GetcitaById(int id)
        {
            throw new NotImplementedException();
        }
        public Task<cita> Postcita(cita cita)
        {
            throw new NotImplementedException();
        }
        public Task<cita> Putcita(cita cita)
        {
            throw new NotImplementedException();
        }
    }


}
  
