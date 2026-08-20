using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;

namespace WebApplication1.repositories
{

    public class menu_rolrepositories : Imenu_rol
    {
        private readonly serena context;

        public menu_rolrepositories(serena context)

        {
            this.context = context;
        }

        public async Task<List<menu_rol>> Getmenu_rol()
        {
            var data = await context.menu_rol.ToListAsync();
            return data;

        }
    }
}
