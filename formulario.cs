using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
	public class formulario
	{
		[Key]
		public int id_formulario { get; set; }

		[Required]
		[StringLength(150)]
		public string nombre_formulario { get; set; }

		[ForeignKey("id_usuario")]
		public int id_usuario { get; set; }
	}
}
