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
            var data = await context.menu.AsNoTracking().ToListAsync();
            return data;
        }

        public async Task<menu?> GetmenuById(int id)
        {
            return await context.menu.AsNoTracking().FirstOrDefaultAsync(x => x.id_menu == id);
        }

        public async Task<menu> Postmenu(menu value)
        {
            context.menu.Add(value);
            await context.SaveChangesAsync();
            return value;
        }

        public async Task<menu?> Putmenu(menu value)
        {
            var item = await context.menu.FindAsync(value.id_menu);
            if (item == null) return null;
            item.nombre_menu = value.nombre_menu;
            await context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> Deletemenu(int id)
        {
            var item = await context.menu.FindAsync(id);
            if (item == null) return false;
            context.menu.Remove(item);
            await context.SaveChangesAsync();
            return true;
        }
    }

}



