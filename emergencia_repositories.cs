using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.emergenciarepositories
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

