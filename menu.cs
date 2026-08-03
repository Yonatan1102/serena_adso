using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class menu
{
    [Key]
    [Column("id_menu")]
    public int id_menu { get; set; }

    [Required]
    [StringLength(50)]
    [Column("nombre_menu")]
    public string nombre_menu { get; set; }


    public virtual ICollection<menu_rol> menu_rol { get; set; }

}
