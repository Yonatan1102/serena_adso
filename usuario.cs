using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class usuario
{
    [Key]
    [Column("id_usuario")]
    public int id_usuario { get; set; }

    [Required(ErrorMessage = "Campo Requerido")]
    [StringLength(50)]
    [Column("nombre_usuario")]
    public required string nombre_usuario { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(150)]
    [Column("email")]
    public required string email { get; set; }

    [Column("id_rol")]
    public int id_rol { get; set; }

    public virtual required historial_clinico historial_Clinico { get; set; }

    public virtual ICollection<formulario> formularios { get; set; } = new List<formulario>();
    public virtual ICollection<estado_de_animo> estado_de_animo { get; set; } = new List<estado_de_animo>();
     
}
