using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApplication1.models
{

    [Table("Cita")]
    public class Cita
    {

        [Key]
        [Column("id_cita")]
        public int id_cita { get; set; }

        [Column("fecha_hora")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime fecha_hora { get; set; }

        [Required]
        [StringLength(300)]
        [Column("motivo")]
        public string? motivo { get; set; }

        [Required]
        [AllowedValues("Pendiente", "Confirmada", "Realizada", "Cancelada")]
        public string estado_cita { get; set; } = null!;

        [Column("id_usuario_aprendiz")]
        public int id_usuario_aprendiz { get; set; }

        [Column("id_usuario_psicologo")]
        public int id_usuario_psicologo { get; set; }

        [ForeignKey(nameof(id_usuario_aprendiz))]
        [JsonIgnore]
        public virtual Usuario? id_usuario_aprendiz_navegacion { get; set; }

        [ForeignKey(nameof(id_usuario_psicologo))]
        [JsonIgnore]
        public virtual Usuario? id_usuario_psicologo_navegacion { get; set; }

        public virtual ICollection<HistorialCita> historial_citas { get; set; } = new List<HistorialCita>();
    }
}