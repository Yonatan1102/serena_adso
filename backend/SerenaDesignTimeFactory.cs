using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace WebApplication1;

internal sealed class SerenaDesignTimeFactory : IDesignTimeDbContextFactory<serena>
{
    public serena CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("SERENA_CONNECTION_STRING") ??
            "Server=localhost;Database=serena;Trusted_Connection=True;TrustServerCertificate=True";

        var options = new DbContextOptionsBuilder<serena>()
            .UseSqlServer(connectionString)
            .Options;

        return new serena(options);
    }
}
