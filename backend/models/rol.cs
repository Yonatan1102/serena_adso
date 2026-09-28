using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.models
{
    [Table("rol")]
    public class rol
    {
        [Key]
        [Column("id_rol")]
        public int id_rol { get; set; }

        [Required]
        [StringLength(50)]
        [Column("nombre_rol")]
        public string nombre_rol { get; set; } = string.Empty;

        public virtual ICollection<usuario> usuario { get; set; } = new List<usuario>();
        public virtual ICollection<menu_rol> menu_rol { get; set; } = new List<menu_rol>();


    }
}
