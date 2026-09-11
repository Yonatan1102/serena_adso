using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.models
{
    [Table("estado_de_animo")]
    public class estado_de_animo
    {
        [Key]
        [Column("id_estado")]
        public int id_estado { get; set; }

        [Required]
        [StringLength(100)]
        [Column("nombre_estado")]
        public string nombre_estado { get; set; } = string.Empty;

        [Column("fecha_estado")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime fecha_estado { get; set; }

        [Column("id_usuario")]
        public int id_usuario { get; set; }

        [ForeignKey(nameof(id_usuario))]
        public virtual usuario? usuario { get; set; }
    }
}
