using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Imenu
    {
        Task<List<menu>> Getmenu();
        Task<menu?> GetmenuById(int id);
        Task<menu> Postmenu(menu menu);
        Task<menu?> Putmenu(menu menu);
        Task<bool> Deletemenu(int id);
    }
}