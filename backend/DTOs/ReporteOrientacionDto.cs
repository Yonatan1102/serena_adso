namespace WebApplication1.DTOs;

/// <summary>Fila del reporte descargable de orientaciones del profesional psicosocial.</summary>
public sealed record ReporteOrientacionResponse(
    int id_orientacion,
    DateTimeOffset fecha_hora,
    string motivo,
    string estado,
    int id_aprendiz,
    string aprendiz,
    string? motivo_cambio);
