using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;

namespace WebApplication1.repositories
{

    public class publicaciones_repositories : Ipublicaciones
    {
        private readonly serena context;

        public publicaciones_repositories(serena context)
        {
            this.context = context;
        }
        public async Task<List<publicaciones>> Getpublicaciones()
        {
            var data = await context.publicaciones.ToListAsync();
            return data;
        }
        public Task<publicaciones> GetpublicacionesById(int id)
        {
            throw new NotImplementedException();
        }
        public Task<publicaciones> Postpublicaciones(publicaciones publicaiones)
        {
            throw new NotImplementedException();
        }
        public Task<publicaciones> Putpublicaciones(publicaciones publicaiones)
        {
            throw new NotImplementedException();
        }
    }
}
