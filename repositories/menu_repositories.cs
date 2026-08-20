using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;




namespace WebApplication1.repositories
{

    public class menu_repositories : Imenu
    {
        private readonly serena context;

        public menu_repositories(serena context)
        {
            this.context = context;
        }
        public async Task<List<menu>> Getmenu()
        {
            var data = await context.menu.ToListAsync();
            return data;

        }
    }

}



