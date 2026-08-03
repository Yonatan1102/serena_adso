using System;
using System.ComponentModel.DataAnnotations;

public class cita
{

	[Key]
	public int id_cita { get; set; }

	[EmailAddress]
	public DateTime fecha_hora { get; set; }

	[Required]
	[StringLength(300)]
	public string? motivo {get; set;}

	[Required]
	[AllowedValues("pendiente", "confirmada", "cancelada", "")]
	public string estado_cita { get; set; }

	public int id_usuario_paciente { get; set; }

	public int id_usuario_psicologo { get; set; }

}
