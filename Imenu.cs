using WebApplication1.models;
using WebApplication1.repositories.interfaces;


namespace WebApplication1.repositories.interfaces
{
    public interface Imenu
    {
        Task<List<menu>> Getmenu();
    }
}