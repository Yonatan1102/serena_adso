using Microsoft.EntityFrameworkCore;


public class DatabaseService : DbContext
{
    public DatabaseService(DbContextOptions options) 
    : base(options)
    {
    }

    public Dbset<serena>
}
