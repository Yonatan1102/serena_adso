using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class publiciones
{
    public int id_publicaciones { get; set; }

    public string titulo { get; set; }

    public string? contenido { get; set; }

    public DateTime fecha_publicaion { get; set; }

    public int id_usuario { get; set; }
}
