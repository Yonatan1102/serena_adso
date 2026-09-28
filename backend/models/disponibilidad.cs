using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.models
{
	[Table("disponibilidad")]
	public class disponibilidad
	{
		[Key]
		[Column("id_disponibilidad")]
		public int id_disponibilidad { get; set; }

		[Column("id_usuario")]
		public int id_usuario { get; set; }

        [Column("id_rol")]
        [Required]
        public int id_rol {get; set;}

        [Required]
        [Range(1,6, ErrorMessage ="el dia debe de esta ente 1(lunes) y 6(sabado)")]
        public byte dia_semana { get; set;}

        [Required]
        [DataType(DataType.Time)]
        public TimeSpan hora_inicio {get; set;}

        [Required]
        [DataType(DataType.Time)]
        public TimeSpan hora_fin {get; set;}

        public bool estado {get; set;} = true;

        [ForeignKey(nameof(id_usuario))]
        public virtual usuario usuario {get; set;} = null!;
        
        [ForeignKey (nameof(id_rol))]
        public virtual rol rol {get; set;} =null!;

	}
}