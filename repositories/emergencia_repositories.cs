using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;

namespace WebApplication1.repositories
{

    public class emergencia_repositories : Iemergencia
    {
        private readonly serena context;

        public emergencia_repositories(serena context)
        {
            this.context = context;
        }

        public async Task<List<emergencia>> Getemergencia()
        {
            var data = await context.emergencia.ToListAsync();
            return data;

        }
    }
}

