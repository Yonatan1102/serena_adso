using System;

public class historial_clinico
{
    public int id_h_clinico { get; set; }
    public int id_usuario { get; set; }
    public string num_ficha { get; set; }
    public DateTime fecha_apertura { get; set; }
    public string condiciones { get; set; }
    public string? antecedentes { get; set; }
}
