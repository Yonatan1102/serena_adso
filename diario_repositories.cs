using WebApplication1.models;
using WebApplication1.repositories.interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;



namespace WebApplication1.diariorepositories
{

    public class diario_repositories : Idiario
    {
        private readonly serena context;

        public diario_repositories(serena context)

        {
            this.context = context;
        }
            public async Task<List<diario>> Getdiario()
        {
            var data = await context.diario.ToListAsync();
            return data;

        }
        public async Task<List<diario>> GetDiario()
        {
            return await context.diario.ToListAsync();
        }
        public Task<diario> GetdiarioById(int id)
        {
            throw new NotImplementedException();
        }
        public Task<diario> Postdiario(diario diario)
        {
            throw new NotImplementedException();
        }
        public Task<diario> Putdiario(diario diario)
        {
            throw new NotImplementedException();
        }
    }
}

