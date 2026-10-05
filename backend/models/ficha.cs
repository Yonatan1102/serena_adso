using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    [Table("ficha")]
    public class ficha
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("id_ficha")]
        public int id_ficha { get; set; }

        [Required]
        [StringLength(50)]
        [Column("codigo_ficha")]
        public string codigo_ficha { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        [Column("programa")]
        public string programa { get; set; } = string.Empty;

        [Column("id_programa")]
        public int id_programa { get; set; }

        [Required]
        [StringLength(50)]
        [Column("centro")]
        public string centro { get; set; } = string.Empty;

        [StringLength(50)]
        [Column("jornada")]
        public string? jornada { get; set; }

        [Column("estado")]
        public bool estado { get; set; } = true;

        public virtual ICollection<usuario_ficha> usuario_fichas { get; set; } = new List<usuario_ficha>();
        [ForeignKey(nameof(id_programa))]
        public virtual programa? programa_navegacion { get; set; }
    }
}
