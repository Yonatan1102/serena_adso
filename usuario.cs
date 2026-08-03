using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class usuario
{
    [Key]
    [column("id_usuario")]
    public int id_usuario { get; set; }

    [Required(ErrorMessage = "Campo Requerido")]
    [StringLength(50)]
    [Column("nombre_usuario")]
    public string nombre_usuario { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(150)]
    [Column("email")]
    public string email { get; set; }

    [Column("id_rol")]
    public int id_rol { get; set; }

    public virtual historial_clinico historial_Clinico { get; set; }

    public virtual ICollection<formulario> Formularios { get; set; } = new List<formulario>();
    public virtual ICollection<estado_de_animo> estado de animo { }.
     
}
