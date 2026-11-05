using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;




namespace WebApplication1.repositories
{

    public class MenuRepository : IMenu
    {
        private readonly SerenaDbContext context;

        public MenuRepository(SerenaDbContext context)
        {
            this.context = context;
        }

        public async Task<List<Menu>> Getmenu()
        {
            var data = await context.Menu.AsNoTracking().ToListAsync();
            return data;
        }

        public async Task<Menu?> GetmenuById(int id)
        {
            return await context.Menu.AsNoTracking().FirstOrDefaultAsync(x => x.id_menu == id);
        }

        public async Task<Menu> Postmenu(Menu value)
        {
            context.Menu.Add(value);
            await context.SaveChangesAsync();
            return value;
        }

        public async Task<Menu?> Putmenu(Menu value)
        {
            var item = await context.Menu.FindAsync(value.id_menu);
            if (item == null) return null;
            item.nombre_menu = value.nombre_menu;
            await context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> Deletemenu(int id)
        {
            var item = await context.Menu.FindAsync(id);
            if (item == null) return false;
            context.Menu.Remove(item);
            await context.SaveChangesAsync();
            return true;
        }
    }

}



