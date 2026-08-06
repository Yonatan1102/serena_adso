using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


[Table("diario")]
public class diario
{
	[Key]
	[Column("id_diario")]
	public int id_diario { get; set; }

	[Column("id_usuario")]
	public int id_usuario { get; set; }

	[Column("fecha_apertura")]
	[DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}")]
	public DateTime fecha_apertura { get; set; }

	[Column("compartir_sp")]
	public Boolean compartir_sp { get; set; }

	[ForeignKey(nameof(id_usuario))]
	public virtual usuario usuario { get; set; }

}