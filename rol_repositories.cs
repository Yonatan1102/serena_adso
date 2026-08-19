using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.rolrepositories
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
