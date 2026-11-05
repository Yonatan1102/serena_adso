using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.models
{
    [Table("HistorialCita")]
    public class HistorialCita
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

        [ForeignKey(nameof(id_cita))]
        public virtual Cita? Cita { get; set; }

    }
}
