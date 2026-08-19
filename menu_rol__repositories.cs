using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.menu_rolrepositories
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
