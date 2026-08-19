using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;




namespace WebApplication1.menurepositories
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



