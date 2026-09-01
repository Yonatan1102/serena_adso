using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Imenu_rol
    {
        Task<List<menu_rol>> Getmenu_rol();
        Task<menu_rol?> Getmenu_rolById(int id);
        Task<menu_rol> Postmenu_rol(menu_rol menu_rol);
        Task<menu_rol?> Putmenu_rol(menu_rol menu_rol);
        Task<bool> Deletemenu_rol(int id);
    }
}