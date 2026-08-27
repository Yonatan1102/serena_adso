using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    [Table("publicaciones")]
    public class publicaciones
    {
        [Key]
        [Column("id_publicaciones")]
        public int id_publicaciones { get; set; }

        [Column("titulo")]
        [StringLength(100)]
        public string titulo { get; set; } = string.Empty;

        [Column("contenido")]
        public string? contenido { get; set; }

        [Column("fecha_publicacion")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime fecha_publicacion { get; set; }

        [Column("id_usuario")]
        public int id_usuario { get; set; }
    }
}