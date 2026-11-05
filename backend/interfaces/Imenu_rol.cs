using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IMenuRol
    {
        Task<List<MenuRol>> Getmenu_rol();
        Task<MenuRol?> Getmenu_rolById(int id);
        Task<MenuRol> Postmenu_rol(MenuRol MenuRol);
        Task<MenuRol?> Putmenu_rol(MenuRol MenuRol);
        Task<bool> Deletemenu_rol(int id);
    }
}