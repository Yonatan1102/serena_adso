using WebApplication1.models;


namespace WebApplication1.interfaces
{
    public interface Imenu
    {
        Task<List<menu>> Getmenu();
    }
}