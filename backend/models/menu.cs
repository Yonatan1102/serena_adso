using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    public class Menu
    {
        [Key]
        [Column("id_menu")]
        public int id_menu { get; set; }

        [Required]
        [StringLength(50)]
        [Column("nombre_menu")]
        public string nombre_menu { get; set; } = string.Empty;


        public virtual ICollection<MenuRol> MenuRol { get; set; } = new List<MenuRol>();

    }
}
