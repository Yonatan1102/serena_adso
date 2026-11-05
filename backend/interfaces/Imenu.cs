using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface IMenu
    {
        Task<List<Menu>> Getmenu();
        Task<Menu?> GetmenuById(int id);
        Task<Menu> Postmenu(Menu Menu);
        Task<Menu?> Putmenu(Menu Menu);
        Task<bool> Deletemenu(int id);
    }
}