using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


[Table("emergencia")]
public class emergencia
{
	[Key]
	[Column("id_emergencia")]
	public int id_emergencia { get; set; }

	[Column("id_usuario")]
	public int id_usuario { get; set; }

	[Column("fecha_emergencia")]
	[DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}")]
	public DateTime fecha_emergencia { get; set; }


	[Required]
	[StringLength(500)]
	[Column("descripcion")]
	public string? descripcion { get; set; }

}
