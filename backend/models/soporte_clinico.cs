using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models;

[Table("soporte_clinico")]
public sealed class soporte_clinico
{
    [Key]
    public int id_soporte { get; set; }

    [Required]
    public int id_aprendiz { get; set; }

    [Required, StringLength(255)]
    public string nombre_archivo { get; set; } = string.Empty;

    [StringLength(500)]
    public string? descripcion { get; set; }

    [Required]
    public byte[] archivo { get; set; } = [];

    public DateTime fecha_carga { get; set; }
}