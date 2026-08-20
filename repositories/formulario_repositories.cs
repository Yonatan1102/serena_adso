using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;



namespace WebApplication1.repositories
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

