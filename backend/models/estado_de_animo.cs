using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.models
{
    [Table("EstadoDeAnimo")]
    public class EstadoDeAnimo
    {
        [Key]
        [Column("id_estado")]
        public int id_estado { get; set; }

        [Required]
        [StringLength(100)]
        [Column("nombre_estado")]
        public string nombre_estado { get; set; } = string.Empty;

        public virtual ICollection<EstadoAnimoUsuario> estado_animo_usuarios { get; set; } = new List<EstadoAnimoUsuario>();
    }
}
