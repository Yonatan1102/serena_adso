using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.models
{
    [Table("historial_cita")]
    public class historial_cita
    {
        [Key]
        [Column("id_h_cita")]
        public int id_h_cita { get; set; }

        [Column("id_cita")]
        public int id_cita { get; set; }

        [Column("observaciones_historial")]
        public string? observaciones_historial { get; set; }

        [Column("fecha_cambio")]
        [DataType(DataType.DateTime)]
        public DateTime fecha_cambio { get; set; }

        [Column("estado_anterior")]
        public string? estado_anterior { get; set; }

        [Column("estado_nuevo")]
        public string? estado_nuevo { get; set; }

        [Column("motivo_cambio")]
        [StringLength(300)]
        public string? motivo_cambio { get; set; }

        [ForeignKey(nameof(id_cita))]
        public virtual cita? cita { get; set; }

    }
}
