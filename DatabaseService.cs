using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1
{
    public class serena : DbContext
    {
        public serena(DbContextOptions options) : base(options)
        {
        }

        public DbSet<usuario> usuario { get; set; }
        public DbSet<rol> rol { get; set; }
        public DbSet<menu> menu { get; set; }
        public DbSet<menu_rol> menu_rol { get; set; }
        public DbSet<formulario> formulario { get; set; }
        public DbSet<cita> cita { get; set; }
        public DbSet<historial_cita> historial_cita { get; set; }
        public DbSet<historial_clinico> historial_clinico { get; set; }
        public DbSet<estado_de_animo> estado_de_animo { get; set; }
        public DbSet<diario> diario { get; set; }
        public DbSet<publicaciones> publicaciones { get; set; }
        public DbSet<emergencia> emergencia { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            EntityConfifuration(modelBuilder);
        }


        private void EntityConfifuration(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<usuario>().ToTable("usuario");
            modelBuilder.Entity<usuario>().HasKey(u => u.id_usuario);
            modelBuilder.Entity<usuario>().Property(u => u.nombre_usuario).HasColumnName("nombre_usuario").ValueGeneratedOnAdd();
            modelBuilder.Entity<usuario>().Property(u => u.email).HasColumnName("email");
            modelBuilder.Entity<usuario>().Property(u => u.id_rol).HasColumnName("id_rol");


            modelBuilder.Entity<rol>().ToTable("rol");
            modelBuilder.Entity<rol>().HasKey(u => u.id_rol);
            modelBuilder.Entity<rol>().Property(u => u.nombre_rol).HasColumnName("nombre_rol");


            modelBuilder.Entity<menu>().ToTable("menu");
            modelBuilder.Entity<menu>().HasKey(u => u.id_menu);
            modelBuilder.Entity<menu>().Property(u => u.nombre_menu).HasColumnName("nombre_menu");


            modelBuilder.Entity<menu_rol>().ToTable("menu_rol");
            modelBuilder.Entity<menu_rol>().HasKey(u => u.id_menu_rol);
            modelBuilder.Entity<menu_rol>().Property(u => u.id_menu_rol).HasColumnName("id_menu_rol").ValueGeneratedOnAdd();
            modelBuilder.Entity<menu_rol>().Property(u => u.id_rol).HasColumnName("id_rol");
            modelBuilder.Entity<menu_rol>().Property(u => u.id_menu).HasColumnName("id_menu");


            modelBuilder.Entity<formulario>().ToTable("formulario");
            modelBuilder.Entity<formulario>().HasKey(u => u.id_formulario);
            modelBuilder.Entity<formulario>().Property(u => u.id_formulario).HasColumnName("id_formulario").ValueGeneratedOnAdd();
            modelBuilder.Entity<formulario>().Property(u => u.nombre_formulario).HasColumnName("nombre_formulario");
            modelBuilder.Entity<formulario>().Property(u => u.id_usuario).HasColumnName("id_usuario");


            modelBuilder.Entity<cita>().ToTable("cita");
            modelBuilder.Entity<cita>().HasKey(u => u.id_cita);
            modelBuilder.Entity<cita>().Property(u => u.id_cita).HasColumnName("id_cita").ValueGeneratedOnAdd();
            modelBuilder.Entity<cita>().Property(u => u.fecha_hora).HasColumnName("fecha_hora");
            modelBuilder.Entity<cita>().Property(u => u.motivo).HasColumnName("motivo");
            modelBuilder.Entity<cita>().Property(u => u.estado_cita).HasColumnName("estado_cita");
            modelBuilder.Entity<cita>().Property(u => u.id_usuario_aprendiz).HasColumnName("id_usuario_aprendiz");
            modelBuilder.Entity<cita>().Property(u => u.id_usuario_psicologo).HasColumnName("id_usuario_psicologo");


            modelBuilder.Entity<historial_cita>().ToTable("historial_cita");
            modelBuilder.Entity<historial_cita>().HasKey(u => u.id_h_cita);
            modelBuilder.Entity<historial_cita>().Property(u => u.id_cita).HasColumnName("id_cita").ValueGeneratedOnAdd();
            modelBuilder.Entity<historial_cita>().Property(u => u.observaciones_historial).HasColumnName("observacion_historial");
            modelBuilder.Entity<historial_cita>().Property(u => u.fecha_cambio).HasColumnName("fecha_cambio");


            modelBuilder.Entity<historial_clinico>().ToTable("historial_clinico");
            modelBuilder.Entity<historial_clinico>().HasKey(u => u.id_h_clinico);
            modelBuilder.Entity<historial_clinico>().Property(u => u.id_h_clinico).HasColumnName("id_h_clinico").ValueGeneratedOnAdd();
            modelBuilder.Entity<historial_clinico>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<historial_clinico>().Property(u => u.num_ficha).HasColumnName("num_ficha");
            modelBuilder.Entity<historial_clinico>().Property(u => u.fecha_apertura).HasColumnName("fecha_apertura");
            modelBuilder.Entity<historial_clinico>().Property(u => u.condiciones).HasColumnName("condiciones");
            modelBuilder.Entity<historial_clinico>().Property(u => u.antecedentes).HasColumnName("antecedentes");


            modelBuilder.Entity<estado_de_animo>().ToTable("estado_de_animo");
            modelBuilder.Entity<estado_de_animo>().HasKey(u => u.id_estado);
            modelBuilder.Entity<estado_de_animo>().Property(u => u.id_estado).HasColumnName("id_estado").ValueGeneratedOnAdd();
            modelBuilder.Entity<estado_de_animo>().Property(u => u.nombre_estado).HasColumnName("nombre_estado");
            modelBuilder.Entity<estado_de_animo>().Property(u => u.fecha_estado).HasColumnName("fecha_estado");
            modelBuilder.Entity<estado_de_animo>().Property(u => u.id_usuario).HasColumnName("id_usuario");

            modelBuilder.Entity<diario>().ToTable("diario");
            modelBuilder.Entity<diario>().HasKey(u => u.id_diario);
            modelBuilder.Entity<diario>().Property(u => u.id_diario).HasColumnName("id_diario").ValueGeneratedOnAdd();
            modelBuilder.Entity<diario>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<diario>().Property(u => u.fecha_apertura).HasColumnName("fecha_diario");
            modelBuilder.Entity<diario>().Property(u => u.compartir_sp).HasColumnName("compartir");

            modelBuilder.Entity<publicaciones>().ToTable("publicaciones");
            modelBuilder.Entity<publicaciones>().HasKey(u => u.id_publicaciones);
            modelBuilder.Entity<publicaciones>().Property(u => u.id_publicaciones).HasColumnName("id_publicacion").ValueGeneratedOnAdd();
            modelBuilder.Entity<publicaciones>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<publicaciones>().Property(u => u.titulo).HasColumnName("titulo");
            modelBuilder.Entity<publicaciones>().Property(u => u.contenido).HasColumnName("contenido");
            modelBuilder.Entity<publicaciones>().Property(u => u.fecha_publicacion).HasColumnName("fecha_publicacion");

            modelBuilder.Entity<emergencia>().ToTable("emergencia");
            modelBuilder.Entity<emergencia>().HasKey(u => u.id_emergencia);
            modelBuilder.Entity<emergencia>().Property(u => u.id_emergencia).HasColumnName("id_emergencia").ValueGeneratedOnAdd();
            modelBuilder.Entity<emergencia>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<emergencia>().Property(u => u.descripcion).HasColumnName("descripcion");
            modelBuilder.Entity<emergencia>().Property(u => u.fecha_emergencia).HasColumnName("fecha_emergencia");

        }

        public async Task<bool> SaveChangesAsync()
        {
            return await base.SaveChangesAsync() > 0;
        }
    }
}


