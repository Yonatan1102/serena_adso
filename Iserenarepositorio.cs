namespace WebApplication1
{
    public interface Iserenarepositorio
    {

        Task <rol> getrol();

        Task <menu> getmenu();

        Task <menu_rol> getmenu_rol();

        Task <diario> getdiario();

        Task <formulario> Getformulario();

        Task <cita> Getcita();

        Task <historial_cita> Getrolhistorial_cita();
        
        Task <historial_clinico> Getrolhistorial_clinico();

        Task <publicaciones> Getpublicaciones();

        Task <emergencia> Getemergencia();

        Task<estado_de_animo> Getestado_de_animo();
    }
}