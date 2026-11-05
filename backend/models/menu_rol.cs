using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
    public class MenuRol
    {
        [Key]
        [Column("id_menu_rol")]
        public int id_menu_rol { get; set; }

        [Column("id_rol")]
        public int id_rol { get; set; }


        [Column("id_menu")]
        public int id_menu { get; set; }


        [ForeignKey(nameof(id_rol))]
        public virtual Rol Rol { get; set; } = null!;

        [ForeignKeyAttribute(nameof(id_menu))]
        public virtual Menu Menu { get; set; } = null!;
    }
}