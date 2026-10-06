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
        public DbSet<soporte_clinico> soporte_clinico { get; set; }
        public DbSet<anotacion_clinica> anotacion_clinica { get; set; }
        public DbSet<estado_de_animo> estado_de_animo { get; set; }
        public DbSet<estado_animo_usuario> estado_animo_usuario { get; set; }
        public DbSet<diario> diario { get; set; }
        public DbSet<publicaciones> publicaciones { get; set; }
        public DbSet<emergencia> emergencia { get; set; }
        public DbSet<disponibilidad> disponibilidad { get; set; } = null!;
        public DbSet<ficha> ficha { get; set; } = null!;
        public DbSet<usuario_ficha> usuario_ficha { get; set; } = null!;
        public DbSet<programa> programa { get; set; } = null!;
        public DbSet<verificacion_correo> verificacion_correo { get; set; } = null!;
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
            modelBuilder.Entity<usuario>().Property(u => u.contrasena).HasColumnName("contrasena");
            modelBuilder.Entity<usuario>().Property(u => u.id_rol).HasColumnName("id_rol");
            modelBuilder.Entity<usuario>().Property(u => u.documento).HasColumnName("documento").HasMaxLength(30);
            modelBuilder.Entity<usuario>().Property(u => u.acepta_tratamiento_datos).HasColumnName("acepta_tratamiento_datos");
            modelBuilder.Entity<usuario>().Property(u => u.fecha_consentimiento).HasColumnName("fecha_consentimiento");
            modelBuilder.Entity<usuario>().Property(u => u.id_ficha).HasColumnName("id_ficha");
            modelBuilder.Entity<usuario>().Property(u => u.email_verificado).HasColumnName("email_verificado");
            modelBuilder.Entity<usuario>()
                .HasOne(u => u.rol)
                .WithMany(r => r.usuario)
                .HasForeignKey(u => u.id_rol)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<usuario>()
                .HasOne(u => u.ficha)
                .WithMany()
                .HasForeignKey(u => u.id_ficha)
                .OnDelete(DeleteBehavior.Restrict);


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
            modelBuilder.Entity<cita>().HasOne<usuario>().WithMany().HasForeignKey(c => c.id_usuario_aprendiz).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<cita>().HasOne<usuario>().WithMany().HasForeignKey(c => c.id_usuario_psicologo).OnDelete(DeleteBehavior.NoAction);


            modelBuilder.Entity<historial_cita>().ToTable("historial_cita");
            modelBuilder.Entity<historial_cita>().HasKey(u => u.id_h_cita);
            modelBuilder.Entity<historial_cita>().Property(u => u.id_cita).HasColumnName("id_cita");
            modelBuilder.Entity<historial_cita>().Property(u => u.observaciones_historial).HasColumnName("observacion_historial");
            modelBuilder.Entity<historial_cita>().Property(u => u.fecha_cambio).HasColumnName("fecha_cambio");
            modelBuilder.Entity<historial_cita>().Property(u => u.estado_anterior).HasColumnName("estado_anterior");
            modelBuilder.Entity<historial_cita>().Property(u => u.estado_nuevo).HasColumnName("estado_nuevo");
            modelBuilder.Entity<historial_cita>().Property(u => u.motivo_cambio).HasColumnName("motivo_cambio").HasMaxLength(300);


            modelBuilder.Entity<historial_clinico>().ToTable("historial_clinico");
            modelBuilder.Entity<historial_clinico>().HasKey(u => u.id_h_clinico);
            modelBuilder.Entity<historial_clinico>().Property(u => u.id_h_clinico).HasColumnName("id_h_clinico").ValueGeneratedOnAdd();
            modelBuilder.Entity<historial_clinico>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<historial_clinico>().Property(u => u.num_ficha).HasColumnName("num_ficha");
            modelBuilder.Entity<historial_clinico>().Property(u => u.fecha_apertura).HasColumnName("fecha_apertura");
            modelBuilder.Entity<historial_clinico>().Property(u => u.condiciones).HasColumnName("condiciones");
            modelBuilder.Entity<historial_clinico>().Property(u => u.antecedentes).HasColumnName("antecedentes");

            modelBuilder.Entity<soporte_clinico>().HasKey(item => item.id_soporte);
            modelBuilder.Entity<soporte_clinico>().Property(item => item.id_soporte).ValueGeneratedOnAdd();
            modelBuilder.Entity<soporte_clinico>().Property(item => item.nombre_archivo).HasMaxLength(255).IsRequired();
            modelBuilder.Entity<soporte_clinico>().Property(item => item.descripcion).HasMaxLength(500);
            modelBuilder.Entity<soporte_clinico>().Property(item => item.archivo).HasColumnType("varbinary(max)").IsRequired();
            modelBuilder.Entity<soporte_clinico>().HasIndex(item => item.id_aprendiz);

            modelBuilder.Entity<anotacion_clinica>().HasKey(item => item.id_anotacion);
            modelBuilder.Entity<anotacion_clinica>().Property(item => item.id_anotacion).ValueGeneratedOnAdd();
            modelBuilder.Entity<anotacion_clinica>().Property(item => item.nombre_psicosocial).HasMaxLength(50).IsRequired();
            modelBuilder.Entity<anotacion_clinica>().Property(item => item.tipo).HasMaxLength(30).IsRequired();
            modelBuilder.Entity<anotacion_clinica>().Property(item => item.contenido).HasMaxLength(4000).IsRequired();
            modelBuilder.Entity<anotacion_clinica>().HasIndex(item => item.id_aprendiz);


            modelBuilder.Entity<estado_de_animo>().ToTable("estado_de_animo");
            modelBuilder.Entity<estado_de_animo>().HasKey(u => u.id_estado);
            modelBuilder.Entity<estado_de_animo>().Property(u => u.id_estado).HasColumnName("id_estado").ValueGeneratedOnAdd();
            modelBuilder.Entity<estado_de_animo>().Property(u => u.nombre_estado).HasColumnName("nombre_estado");

            modelBuilder.Entity<estado_animo_usuario>().ToTable("estado_animo_usuario");
            modelBuilder.Entity<estado_animo_usuario>().HasKey(u => u.id_estado_usuario);
            modelBuilder.Entity<estado_animo_usuario>().Property(u => u.id_estado_usuario).HasColumnName("id_estado_usuario").ValueGeneratedOnAdd();
            modelBuilder.Entity<estado_animo_usuario>().Property(u => u.id_estado).HasColumnName("id_estado");
            modelBuilder.Entity<estado_animo_usuario>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<estado_animo_usuario>().Property(u => u.fecha_estado).HasColumnName("fecha_estado");
            modelBuilder.Entity<estado_animo_usuario>().Property(u => u.motivo).HasColumnName("motivo");
            modelBuilder.Entity<estado_animo_usuario>()
                .HasOne(u => u.usuario)
                .WithMany(u => u.estado_animo_usuarios)
                .HasForeignKey(u => u.id_usuario)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<estado_animo_usuario>()
                .HasOne(u => u.estado_de_animo)
                .WithMany(e => e.estado_animo_usuarios)
                .HasForeignKey(u => u.id_estado)
                .OnDelete(DeleteBehavior.Restrict);

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
            modelBuilder.Entity<publicaciones>().Property(u => u.id_comunidad).HasColumnName("id_comunidad");
            modelBuilder.Entity<publicaciones>().Property(u => u.etiqueta).HasColumnName("etiqueta");
            modelBuilder.Entity<publicaciones>().Property(u => u.votos).HasColumnName("votos");
            modelBuilder.Entity<publicaciones>().Property(u => u.comentarios_count).HasColumnName("comentarios_count");
            modelBuilder.Entity<publicaciones>().Property(u => u.imagen_url).HasColumnName("imagen_url");

            modelBuilder.Entity<emergencia>().ToTable("emergencia");
            modelBuilder.Entity<emergencia>().HasKey(u => u.id_emergencia);
            modelBuilder.Entity<emergencia>().Property(u => u.id_emergencia).HasColumnName("id_emergencia").ValueGeneratedOnAdd();
            modelBuilder.Entity<emergencia>().Property(u => u.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<emergencia>().Property(u => u.descripcion).HasColumnName("descripcion");
            modelBuilder.Entity<emergencia>().Property(u => u.fecha_emergencia).HasColumnName("fecha_emergencia");

            modelBuilder.Entity<disponibilidad>().ToTable("disponibilidad");
            modelBuilder.Entity<disponibilidad>().HasKey(d => d.id_disponibilidad);
            modelBuilder.Entity<disponibilidad>().Property(d => d.id_disponibilidad).HasColumnName("id_disponibilidad").ValueGeneratedOnAdd();
            modelBuilder.Entity<disponibilidad>().Property(d => d.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<disponibilidad>().Property(d => d.id_rol).HasColumnName("id_rol");
            modelBuilder.Entity<disponibilidad>().Property(d => d.fecha).HasColumnName("fecha").HasColumnType("date");
            modelBuilder.Entity<disponibilidad>().Property(d => d.hora_inicio).HasColumnName("hora_inicio");
            modelBuilder.Entity<disponibilidad>().Property(d => d.hora_fin).HasColumnName("hora_fin");
            modelBuilder.Entity<disponibilidad>().Property(d => d.estado).HasColumnName("estado");
            modelBuilder.Entity<disponibilidad>()
                .HasOne(d => d.usuario)
                .WithMany(u => u.disponibilidades)
                .HasForeignKey(d => d.id_usuario)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<disponibilidad>()
                .HasOne(d => d.rol)
                .WithMany(r => r.disponibilidades)
                .HasForeignKey(d => d.id_rol)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ficha>().ToTable("ficha");
            modelBuilder.Entity<ficha>().HasKey(f => f.id_ficha);
            modelBuilder.Entity<ficha>().Property(f => f.id_ficha).ValueGeneratedNever();
            modelBuilder.Entity<ficha>().HasOne(f => f.programa_navegacion)
                .WithMany(p => p.fichas).HasForeignKey(f => f.id_programa).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<ficha>().Property(f => f.id_ficha).HasColumnName("id_ficha");
            modelBuilder.Entity<ficha>().Property(f => f.codigo_ficha).HasColumnName("codigo_ficha");
            modelBuilder.Entity<ficha>().Property(f => f.programa).HasColumnName("programa");
            modelBuilder.Entity<ficha>().Property(f => f.id_programa).HasColumnName("id_programa");
            modelBuilder.Entity<ficha>().Property(f => f.centro).HasColumnName("centro");
            modelBuilder.Entity<ficha>().Property(f => f.jornada).HasColumnName("jornada");
            modelBuilder.Entity<ficha>().Property(f => f.estado).HasColumnName("estado");

            modelBuilder.Entity<usuario_ficha>().ToTable("usuario_ficha");
            modelBuilder.Entity<usuario_ficha>().HasKey(uf => uf.id_usuario_ficha);
            modelBuilder.Entity<usuario_ficha>().Property(uf => uf.id_usuario_ficha).HasColumnName("id_usuario_ficha").ValueGeneratedOnAdd();
            modelBuilder.Entity<usuario_ficha>().Property(uf => uf.id_usuario).HasColumnName("id_usuario");
            modelBuilder.Entity<usuario_ficha>().Property(uf => uf.id_ficha).HasColumnName("id_ficha");
            modelBuilder.Entity<usuario_ficha>().Property(uf => uf.fecha_asignacion).HasColumnName("fecha_asignacion");
            modelBuilder.Entity<usuario_ficha>().Property(uf => uf.estado).HasColumnName("estado");
            modelBuilder.Entity<usuario_ficha>()
                .HasOne(uf => uf.usuario)
                .WithMany(u => u.usuario_fichas)
                .HasForeignKey(uf => uf.id_usuario)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<programa>().ToTable("programa");
            modelBuilder.Entity<programa>().HasKey(p => p.id_programa);
            modelBuilder.Entity<programa>().Property(p => p.id_programa).ValueGeneratedOnAdd();
            modelBuilder.Entity<programa>().HasIndex(p => p.nombre_programa).IsUnique();

            modelBuilder.Entity<verificacion_correo>().ToTable("verificacion_correo");
            modelBuilder.Entity<verificacion_correo>().HasKey(v => v.id_verificacion);
            modelBuilder.Entity<verificacion_correo>().Property(v => v.id_verificacion).ValueGeneratedOnAdd();
            modelBuilder.Entity<verificacion_correo>().HasIndex(v => v.id_usuario).IsUnique();
            modelBuilder.Entity<verificacion_correo>().Property(v => v.proposito).HasMaxLength(30).HasDefaultValue("verificacion-correo");
            modelBuilder.Entity<verificacion_correo>().HasOne(v => v.usuario)
                .WithMany().HasForeignKey(v => v.id_usuario).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<usuario_ficha>()
                .HasOne(uf => uf.ficha)
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
