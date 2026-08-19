using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;



namespace WebApplication1.formulario_repositories
{

    public class formulario_repositories : Iformulario
    {
        private readonly serena context;

        public formulario_repositories(serena context)

        {
            this.context = context;
        }

        public async Task<List<formulario>> Getformulario()
        {
            var data = await context.formulario.ToListAsync();
            return data;

        }
    }

}

