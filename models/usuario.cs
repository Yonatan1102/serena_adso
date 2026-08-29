using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    public class usuario
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

        

        [Column("id_rol")]
        public int id_rol { get; set; }

        [ForeignKey(nameof(id_rol))]
        [InverseProperty(nameof(rol.usuario))]
        public virtual rol? rol { get; set; }

        public virtual historial_clinico? historial_Clinico { get; set; }
        public virtual ICollection<formulario> formularios { get; set; } = new List<formulario>();
        public virtual ICollection<estado_de_animo> estado_de_animo { get; set; } = new List<estado_de_animo>();

    }
}
