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

        public virtual ICollection<estado_animo_usuario> estado_animo_usuarios { get; set; } = new List<estado_animo_usuario>();
    }
}
