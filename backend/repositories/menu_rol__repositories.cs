using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;

namespace WebApplication1.repositories
{

    public class menu_rol_repositories : Imenu_rol
    {
        private readonly serena context;

        public menu_rol_repositories(serena context)

        {
            this.context = context;
        }

        public async Task<List<menu_rol>> Getmenu_rol()
        {
            var data = await context.menu_rol.AsNoTracking().ToListAsync();
            return data;
        }

        public async Task<menu_rol?> Getmenu_rolById(int id)
        {
            return await context.menu_rol.AsNoTracking().FirstOrDefaultAsync(x => x.id_menu_rol == id);
        }

        public async Task<menu_rol> Postmenu_rol(menu_rol value)
        {
            context.menu_rol.Add(value);
            await context.SaveChangesAsync();
            return value;
        }

        public async Task<menu_rol?> Putmenu_rol(menu_rol value)
        {
            var item = await context.menu_rol.FindAsync(value.id_menu_rol);
            if (item == null) return null;
            item.id_menu = value.id_menu;
            item.id_rol = value.id_rol;
            await context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> Deletemenu_rol(int id)
        {
            var item = await context.menu_rol.FindAsync(id);
            if (item == null) return false;
            context.menu_rol.Remove(item);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
