using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models;

[Table("programa")]
public class programa
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_programa")]
    public int id_programa { get; set; }

    [Required]
    [StringLength(150)]
    [Column("nombre_programa")]
    public string nombre_programa { get; set; } = string.Empty;

    public virtual ICollection<ficha> fichas { get; set; } = new List<ficha>();
}
