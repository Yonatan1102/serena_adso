using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models;

[Table("verificacion_correo")]
public class verificacion_correo
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_verificacion")]
    public int id_verificacion { get; set; }

    [Required]
    [Column("id_usuario")]
    public int id_usuario { get; set; }

    [Required]
    [StringLength(500)]
    [Column("codigo_hash")]
    public string codigo_hash { get; set; } = string.Empty;

    [Column("expira_en")]
    public DateTimeOffset expira_en { get; set; }

    [Column("enviado_en")]
    public DateTimeOffset enviado_en { get; set; }

    [Column("intentos")]
    public int intentos { get; set; }

    [ForeignKey(nameof(id_usuario))]
    public virtual usuario usuario { get; set; } = null!;
}
