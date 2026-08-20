using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;

namespace WebApplication1.repositories
{

    public class rol_repositories : Irol
    {
        private readonly serena context;

        public rol_repositories(serena context)

        {
            this.context = context;
        }

        public async Task<List<rol>> Getrol()
        {
            var data = await context.rol.ToListAsync();
            return data;
        }
    }
}
