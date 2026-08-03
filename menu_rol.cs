using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class menu_rol
{
    [Key]
    [Column("id_menu_rol")]
    public int id_menu_rol { get; set; }

    [Column("id_rol")]
    public int id_rol { get; set; }


    [Column("id_menu")]
    public int id_menu { get; set; }


    [ForeignKey(nameof(id_rol))]
    public virtual rol rol { get; set }

    [ForeignKeyAttribute(nameof(id_menu))]
    public virtual menu menu { get; set; }
}
