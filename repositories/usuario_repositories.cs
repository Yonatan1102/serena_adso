using WebApplication1.models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;


namespace WebApplication1.repositories

{

    public class usuario_repositories : Iusuario
    {
        private readonly serena context;

                public usuario_repositories(serena context)
                {
                     this.context = context;
                }


        public async Task<List<usuario>> Getusuario()
        {
            var data = await context.usuario.ToListAsync();
            return data;
        }
        public Task<usuario> GetusuarioById(int id)
        {
            throw new NotImplementedException();
        }
        public Task<usuario> Postusuario()
        {
            throw new NotImplementedException();
        }
        public Task<usuario> Putusuario(usuario usuario)
        {
            throw new NotImplementedException();
        }
    }
    
}




