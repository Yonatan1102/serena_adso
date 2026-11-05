using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;

namespace WebApplication1.repositories
{

    public class MenuRolRepository : IMenuRol
    {
        private readonly SerenaDbContext context;

        public MenuRolRepository(SerenaDbContext context)

        {
            this.context = context;
        }

        public async Task<List<MenuRol>> Getmenu_rol()
        {
            var data = await context.MenuRol.AsNoTracking().ToListAsync();
            return data;
        }

        public async Task<MenuRol?> Getmenu_rolById(int id)
        {
            return await context.MenuRol.AsNoTracking().FirstOrDefaultAsync(x => x.id_menu_rol == id);
        }

        public async Task<MenuRol> Postmenu_rol(MenuRol value)
        {
            context.MenuRol.Add(value);
            await context.SaveChangesAsync();
            return value;
        }

        public async Task<MenuRol?> Putmenu_rol(MenuRol value)
        {
            var item = await context.MenuRol.FindAsync(value.id_menu_rol);
            if (item == null) return null;
            item.id_menu = value.id_menu;
            item.id_rol = value.id_rol;
            await context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> Deletemenu_rol(int id)
        {
            var item = await context.MenuRol.FindAsync(id);
            if (item == null) return false;
            context.MenuRol.Remove(item);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
