using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    [Table("UsuarioFicha")]
    public class UsuarioFicha
    {
        [Key]
        [Column("id_usuario_ficha")]
        public int id_usuario_ficha { get; set; }

        [Required]
        [Column("id_usuario")]
        public int id_usuario { get; set; }

        [Required]
        [Column("id_ficha")]
        public int id_ficha { get; set; }

        [Column("fecha_asignacion")]
        public DateTime? fecha_asignacion { get; set; }

        [Column("estado")]
        public bool estado { get; set; } = true;

        [ForeignKey(nameof(id_usuario))]
        public virtual Usuario Usuario { get; set; } = null!;

        [ForeignKey(nameof(id_ficha))]
        public virtual Ficha Ficha { get; set; } = null!;
    }
}
