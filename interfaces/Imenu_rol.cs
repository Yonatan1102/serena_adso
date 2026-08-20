using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Imenu_rol
    {
        Task<List<menu_rol>> Getmenu_rol();
    }
}