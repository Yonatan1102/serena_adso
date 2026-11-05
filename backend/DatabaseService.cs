using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1
{
    public class SerenaDbContext : DbContext
    {
        public SerenaDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Usuario> Usuario { get; set; }
        public DbSet<Rol> Rol { get; set; }
        public DbSet<Menu> Menu { get; set; }
        public DbSet<MenuRol> MenuRol { get; set; }
        public DbSet<Formulario> Formulario { get; set; }
        public DbSet<Cita> Cita { get; set; }
        public DbSet<HistorialCita> HistorialCita { get; set; }
        public DbSet<HistorialClinico> HistorialClinico { get; set; }
        public DbSet<EstadoDeAnimo> EstadoDeAnimo { get; set; }
        public DbSet<EstadoAnimoUsuario> EstadoAnimoUsuario { get; set; }
        public DbSet<Diario> Diario { get; set; }
        public DbSet<Publicaciones> Publicaciones { get; set; }
        public DbSet<Emergencia> Emergencia { get; set; }
        public DbSet<Disponibilidad> Disponibilidad { get; set; } = null!;
        public DbSet<Ficha> Ficha { get; set; } = null!;
        public DbSet<UsuarioFicha> UsuarioFicha { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            EntityConfiguration(modelBuilder);
        }


        private void EntityConfiguration(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Usuario>().ToTable("Usuario");
            modelBuilder.Entity<Usuario>().HasKey(u => u.id_usuario);
            modelBuilder.Entity<Usuario>().Property(u => u.nombre_usuario).HasColumnName("nombre_usuario").ValueGeneratedOnAdd();
            modelBuilder.Entity<Usuario>().Property(u => u.email).HasColumnName("email");
            modelBuilder.Entity<Usuario>().Property(u => u.contrasena).HasColumnName("contrasena");
            modelBuilder.Entity<Usuario>().Property(u => u.id_rol).HasColumnName("id_rol");
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Rol)
                .WithMany(r => r.Usuario)
                .HasForeignKey(u => u.id_rol)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Rol>().ToTable("Rol");
            modelBuilder.Entity<Rol>().HasKey(u => u.id_rol);
            modelBuilder.Entity<Rol>().Property(u => u.nombre_rol).HasColumnName("nombre_rol");


            modelBuilder.Entity<Menu>().ToTable("Menu");
            modelBuilder.Entity<Menu>().HasKey(u => u.id_menu);
            modelBuilder.Entity<Menu>().Property(u => u.nombre_menu).HasColumnName("nombre_menu");


            modelBuilder.Entity<MenuRol>().ToTable("MenuRol");
            modelBuilder.Entity<MenuRol>().HasKey(u => u.id_menu_rol);
            modelBuilder.Entity<MenuRol>().Property(u => u.id_menu_rol).HasColumnName("id_menu_rol").ValueGeneratedOnAdd();
            modelBuilder.Entity<MenuRol>().Property(u => u.id_rol).HasColumnName("id_rol");
            modelBuilder.Entity<MenuRol>().Property(u => u.id_menu).HasColumnName("id_menu");


            modelBuilder.Entity<Formulario>().ToTable("Formulario");
            modelBuilder.Entity<Formulario>().HasKey(u => u.id_formulario);
            modelBuilder.Entity<Formulario>().Property(u => u.id_formulario).HasColumnName("id_formulario").ValueGeneratedOnAdd();
            modelBuilder.Entity<Formulario>().Property(u => u.nombre_formulario).HasColumnName("nombre_formulario");
            modelBuilder.Entity<Formulario>().Property(u => u.id_usuario).HasColumnName("id_usuario");


            modelBuilder.Entity<Cita>().ToTable("Cita");
            modelBuilder.Entity<Cita>().HasKey(u => u.id_cita);
            modelBuilder.Entity<Cita>().Property(u => u.id_cita).HasColumnName("id_cita").ValueGeneratedOnAdd();
            modelBuilder.Entity<Cita>().Property(u => u.fecha_hora).HasColumnName("fecha_hora");
            modelBuilder.Entity<Cita>().Property(u => u.motivo).HasColumnName("motivo");
            modelBuilder.Entity<Cita>().Property(u => u.estado_cita).HasColumnName("estado_cita");
            modelBuilder.Entity<Cita>().Property(u => u.id_usuario_aprendiz).HasColumnName("id_usuario_aprendiz");
            modelBuilder.Entity<Cita>().Property(u => u.id_usuario_psicologo).HasColumnName("id_usuario_psicologo");
            modelBuilder.Entity<Cita>().HasOne<Usuario>().WithMany().HasForeignKey(c => c.id_usuario_aprendiz).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Cita>().HasOne<Usuario>().WithMany().HasForeignKey(c => c.id_usuario_psicologo).OnDelete(DeleteBehavior.NoAction);


            modelBuilder.Entity<HistorialCita>().ToTable("HistorialCita");
            modelBuilder.Entity<HistorialCita>().HasKey(u => u.id_h_cita);
            modelBuilder.Entity<HistorialCita>().Property(u => u.id_cita).HasColumnName("id_cita").ValueGeneratedOnAdd();
            modelBuilder.Entity<HistorialCita>().Property(u => u.observaciones_historial).HasColumnName("observacion_historial");
            modelBuilder.Entity<HistorialCita>().Property(u => u.fecha_cambio).HasColumnName("fecha_cambio");


            modelBuilder.Entity<HistorialClinico>().ToTable("HistorialClinico");
            modelBuilder.Entity<HistorialClinico>().HasKey(u => u.id_h_clinico);
            modelBuilder.Entity<HistorialClinico>().Property(u => u.id_h_clinico).HasColumnName("id_h_clinico").ValueGeneratedOnAdd();
            modelBuilder.Entity<HistorialClinico>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<HistorialClinico>().Property(u => u.num_ficha).HasColumnName("num_ficha");
            modelBuilder.Entity<HistorialClinico>().Property(u => u.fecha_apertura).HasColumnName("fecha_apertura");
            modelBuilder.Entity<HistorialClinico>().Property(u => u.condiciones).HasColumnName("condiciones");
            modelBuilder.Entity<HistorialClinico>().Property(u => u.antecedentes).HasColumnName("antecedentes");


            modelBuilder.Entity<EstadoDeAnimo>().ToTable("EstadoDeAnimo");
            modelBuilder.Entity<EstadoDeAnimo>().HasKey(u => u.id_estado);
            modelBuilder.Entity<EstadoDeAnimo>().Property(u => u.id_estado).HasColumnName("id_estado").ValueGeneratedOnAdd();
            modelBuilder.Entity<EstadoDeAnimo>().Property(u => u.nombre_estado).HasColumnName("nombre_estado");

            modelBuilder.Entity<EstadoAnimoUsuario>().ToTable("EstadoAnimoUsuario");
            modelBuilder.Entity<EstadoAnimoUsuario>().HasKey(u => u.id_estado_usuario);
            modelBuilder.Entity<EstadoAnimoUsuario>().Property(u => u.id_estado_usuario).HasColumnName("id_estado_usuario").ValueGeneratedOnAdd();
            modelBuilder.Entity<EstadoAnimoUsuario>().Property(u => u.id_estado).HasColumnName("id_estado");
            modelBuilder.Entity<EstadoAnimoUsuario>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<EstadoAnimoUsuario>().Property(u => u.fecha_estado).HasColumnName("fecha_estado");
            modelBuilder.Entity<EstadoAnimoUsuario>().Property(u => u.motivo).HasColumnName("motivo");
            modelBuilder.Entity<EstadoAnimoUsuario>()
                .HasOne(u => u.Usuario)
                .WithMany(u => u.estado_animo_usuarios)
                .HasForeignKey(u => u.id_usuario)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<EstadoAnimoUsuario>()
                .HasOne(u => u.EstadoDeAnimo)
                .WithMany(e => e.estado_animo_usuarios)
                .HasForeignKey(u => u.id_estado)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Diario>().ToTable("Diario");
            modelBuilder.Entity<Diario>().HasKey(u => u.id_diario);
            modelBuilder.Entity<Diario>().Property(u => u.id_diario).HasColumnName("id_diario").ValueGeneratedOnAdd();
            modelBuilder.Entity<Diario>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<Diario>().Property(u => u.fecha_apertura).HasColumnName("fecha_diario");
            modelBuilder.Entity<Diario>().Property(u => u.compartir_sp).HasColumnName("compartir");

            modelBuilder.Entity<Publicaciones>().ToTable("Publicaciones");
            modelBuilder.Entity<Publicaciones>().HasKey(u => u.id_publicaciones);
            modelBuilder.Entity<Publicaciones>().Property(u => u.id_publicaciones).HasColumnName("id_publicacion").ValueGeneratedOnAdd();
            modelBuilder.Entity<Publicaciones>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<Publicaciones>().Property(u => u.titulo).HasColumnName("titulo");
            modelBuilder.Entity<Publicaciones>().Property(u => u.contenido).HasColumnName("contenido");
            modelBuilder.Entity<Publicaciones>().Property(u => u.fecha_publicacion).HasColumnName("fecha_publicacion");
            modelBuilder.Entity<Publicaciones>().Property(u => u.id_comunidad).HasColumnName("id_comunidad");
            modelBuilder.Entity<Publicaciones>().Property(u => u.etiqueta).HasColumnName("etiqueta");
            modelBuilder.Entity<Publicaciones>().Property(u => u.votos).HasColumnName("votos");
            modelBuilder.Entity<Publicaciones>().Property(u => u.comentarios_count).HasColumnName("comentarios_count");
            modelBuilder.Entity<Publicaciones>().Property(u => u.imagen_url).HasColumnName("imagen_url");

            modelBuilder.Entity<Emergencia>().ToTable("Emergencia");
            modelBuilder.Entity<Emergencia>().HasKey(u => u.id_emergencia);
            modelBuilder.Entity<Emergencia>().Property(u => u.id_emergencia).HasColumnName("id_emergencia").ValueGeneratedOnAdd();
            modelBuilder.Entity<Emergencia>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<Emergencia>().Property(u => u.descripcion).HasColumnName("descripcion");
            modelBuilder.Entity<Emergencia>().Property(u => u.fecha_emergencia).HasColumnName("fecha_emergencia");

            modelBuilder.Entity<Disponibilidad>().ToTable("Disponibilidad");
            modelBuilder.Entity<Disponibilidad>().HasKey(d => d.id_disponibilidad);
            modelBuilder.Entity<Disponibilidad>().Property(d => d.id_disponibilidad).HasColumnName("id_disponibilidad").ValueGeneratedOnAdd();
            modelBuilder.Entity<Disponibilidad>().Property(d => d.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<Disponibilidad>().Property(d => d.id_rol).HasColumnName("id_rol");
            modelBuilder.Entity<Disponibilidad>().Property(d => d.dia_semana).HasColumnName("dia_semana");
            modelBuilder.Entity<Disponibilidad>().Property(d => d.hora_inicio).HasColumnName("hora_inicio");
            modelBuilder.Entity<Disponibilidad>().Property(d => d.hora_fin).HasColumnName("hora_fin");
            modelBuilder.Entity<Disponibilidad>().Property(d => d.estado).HasColumnName("estado");
            modelBuilder.Entity<Disponibilidad>()
                .HasOne(d => d.Usuario)
                .WithMany(u => u.disponibilidades)
                .HasForeignKey(d => d.id_usuario)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Disponibilidad>()
                .HasOne(d => d.Rol)
                .WithMany(r => r.disponibilidades)
                .HasForeignKey(d => d.id_rol)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ficha>().ToTable("Ficha");
            modelBuilder.Entity<Ficha>().HasKey(f => f.id_ficha);
            modelBuilder.Entity<Ficha>().Property(f => f.id_ficha).HasColumnName("id_ficha").ValueGeneratedOnAdd();
            modelBuilder.Entity<Ficha>().Property(f => f.codigo_ficha).HasColumnName("codigo_ficha");
            modelBuilder.Entity<Ficha>().Property(f => f.programa).HasColumnName("programa");
            modelBuilder.Entity<Ficha>().Property(f => f.centro).HasColumnName("centro");
            modelBuilder.Entity<Ficha>().Property(f => f.jornada).HasColumnName("jornada");
            modelBuilder.Entity<Ficha>().Property(f => f.estado).HasColumnName("estado");

            modelBuilder.Entity<UsuarioFicha>().ToTable("UsuarioFicha");
            modelBuilder.Entity<UsuarioFicha>().HasKey(uf => uf.id_usuario_ficha);
            modelBuilder.Entity<UsuarioFicha>().Property(uf => uf.id_usuario_ficha).HasColumnName("id_usuario_ficha").ValueGeneratedOnAdd();
            modelBuilder.Entity<UsuarioFicha>().Property(uf => uf.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<UsuarioFicha>().Property(uf => uf.id_ficha).HasColumnName("id_ficha");
            modelBuilder.Entity<UsuarioFicha>().Property(uf => uf.fecha_asignacion).HasColumnName("fecha_asignacion");
            modelBuilder.Entity<UsuarioFicha>().Property(uf => uf.estado).HasColumnName("estado");
            modelBuilder.Entity<UsuarioFicha>()
                .HasOne(uf => uf.Usuario)
                .WithMany(u => u.usuario_fichas)
                .HasForeignKey(uf => uf.id_usuario)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<UsuarioFicha>()
                .HasOne(uf => uf.Ficha)
                .WithMany(f => f.usuario_fichas)
                .HasForeignKey(uf => uf.id_ficha)
                .OnDelete(DeleteBehavior.Cascade);

        }

        public async Task<bool> SaveChangesAsync()
        {
            return await base.SaveChangesAsync() > 0;
        }
    }
}


