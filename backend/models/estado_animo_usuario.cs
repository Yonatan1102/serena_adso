using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    [Table("estado_animo_usuario")]
    public class estado_animo_usuario
    {
        [Key]
        [Column("id_estado_usuario")]
        public int id_estado_usuario { get; set; }

        [Required]
        [Column("id_estado")]
        public int id_estado { get; set; }

        [Required]
        [Column("id_usuario")]
        public int id_usuario { get; set; }

        [Required]
        [Column("fecha_estado")]
        public DateTime fecha_estado { get; set; }

        [Required]
        [StringLength(300)]
        [Column("motivo")]
        public string motivo { get; set; } = string.Empty;

        [ForeignKey(nameof(id_estado))]
        public virtual estado_de_animo? estado_de_animo { get; set; }

        [ForeignKey(nameof(id_usuario))]
        public virtual usuario? usuario { get; set; }
    }
}
