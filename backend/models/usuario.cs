using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    public class Usuario
    {
        [Key]
        [Column("id_usuario")]
        public int id_usuario { get; set; }

        [Required(ErrorMessage = "Campo Requerido")]
        [StringLength(50)]
        [Column("nombre_usuario")]
        public required string nombre_usuario { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(150)]
        [Column("email")]
        public required string email { get; set; }

        [Required]
        [StringLength(255)]
        [Column("contrasena")]
        public required string contrasena { get; set; }

        

        // 1. Clave foránea explícita
        [Column("id_rol")]
        [ForeignKey("Rol")] 
        public int id_rol { get; set; }

        [StringLength(120)]
        public string? sede { get; set; }

        [StringLength(20)]
        public string? centro { get; set; }

        [StringLength(150)]
        public string? programa_formacion { get; set; }

        [StringLength(30)]
        public string? num_ficha { get; set; }

        public virtual Rol? Rol { get; set; }

        public virtual HistorialClinico? historial_Clinico { get; set; }
        public virtual ICollection<Formulario> formularios { get; set; } = new List<Formulario>();
        public virtual ICollection<EstadoAnimoUsuario> estado_animo_usuarios { get; set; } = new List<EstadoAnimoUsuario>();
        public virtual ICollection<Disponibilidad> disponibilidades { get; set; } = new List<Disponibilidad>();
        public virtual ICollection<UsuarioFicha> usuario_fichas { get; set; } = new List<UsuarioFicha>();
    }
}