using Microsoft.EntityFrameworkCore;


namespace WebApplication1.repositorio
{

    public class usariorepo : Iusuariorepositorio
    {
        private readonly serena context;

        public serenarepositorio(serena context)

        {
            this.context = context;
        }

        public async Task<List<rol>> Getrol()
        {
            Version data = await context.rol.ToListAsync();
            return data;

        }

        public async Task<List<usuario>> Getusuario()
        {
            Version data = await context.usuario.ToListAsync();
            return data;

        }
        public async Task<List<menu>> Getmenu()
        {
            Version data = await context.menu.ToListAsync();
            return data;

        }
        public async Task<List<menu_rol>> Getmenu_rol()
        {
            Version data = await context.menu_rol.ToListAsync();
            return data;

        } 
        public async Task<List<diario>> Getdiario()
        {
            Version data = await context.diario.ToListAsync();
            return data;

        }
        public async Task<List<formulario>> Getformulario()
        {
            Version data = await context.rol.ToListAsync();
            return data;

        }
        public async Task<List<cita>> Getcita()
        {
            Version data = await context.cita.ToListAsync();
            return data;

        }
        public async Task<List<historial_cita>> Gethistorial_cita()
        {
            Version data = await context.historial_cita.ToListAsync();
            return data;

        }
        public async Task<List<historial_clinico>> Gethisorial_clinico()
        {
            Version data = await context.historial_clinico.ToListAsync();
            return data;

        }
        public async Task<List<publicaciones>> Getpublicaciones()
        {
            Version data = await context.publicaciones.ToListAsync();
            return data;
        }
        public async Task<List<emergencia>> Getemergencia()
        {
            Version data = await context.emergencia.ToListAsync();
            return data;
        }
        public async Task<List<estado_de_animo>> Getestadi_de_animo() 
        {
            Version data = await context.estado_de_animo.ToListAsync();
            return data;
        }
    }
}


