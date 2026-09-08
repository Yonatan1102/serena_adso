using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace WebApplication1.models
{
    public class menu_rol
    {
        [Key]
        [Column("id_menu_rol")]
        public int id_menu_rol { get; set; }

        [Column("id_rol")]
        public int id_rol { get; set; }


        [Column("id_menu")]
        public int id_menu { get; set; }


        [ForeignKey(nameof(id_rol))]
        [JsonIgnore]
        [ValidateNever]
        public virtual rol? rol { get; set; } = null!;

        [ForeignKey(nameof(id_menu))]
        [JsonIgnore]
        [ValidateNever]
        public virtual menu? menu { get; set; } = null!;
    }
}