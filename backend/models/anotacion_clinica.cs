using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models;

[Table("anotacion_clinica")]
public sealed class anotacion_clinica
{
    [Key]
    public int id_anotacion { get; set; }

    [Required]
    public int id_aprendiz { get; set; }

    [Required]
    public int id_psicosocial { get; set; }

    [Required, StringLength(50)]
    public string nombre_psicosocial { get; set; } = string.Empty;

    [Required, StringLength(30)]
    public string tipo { get; set; } = "Evolución";

    [Required, StringLength(4000)]
    public string contenido { get; set; } = string.Empty;

    public DateTime fecha { get; set; }
}