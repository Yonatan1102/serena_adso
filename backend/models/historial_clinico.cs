using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.models
{
    public class historial_clinico
    {
        [Key]
        [Column("id_h_clinico")]
        public int id_h_clinico { get; set; }
        [Column("id_usuario")]
        public int id_usuario { get; set; }
        [Column("num_ficha")]
        public required string num_ficha { get; set; }

        [Column("fecha_apertura")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime fecha_apertura { get; set; }

        [Column("condiciones")]
        [StringLength(300)]
        public required string condiciones { get; set; }

        [Column("antecedentes")]
        public string? antecedentes { get; set; }

        [ForeignKey(nameof(id_usuario))]
        public virtual usuario? usuario { get; set; }
    }
}