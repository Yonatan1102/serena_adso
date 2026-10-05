namespace WebApplication1.DTOs;

/// <summary>Resumen de un profesional psicosocial para el directorio administrativo.</summary>
public sealed record AdminPsicosocialResponse(
    int id_usuario,
    string nombre,
    string correo,
    string? documento,
    int aprendices_asignados,
    int orientaciones_realizadas);

/// <summary>Aprendiz relacionado con un profesional mediante su historial de orientaciones.</summary>
public sealed record AdminAprendizResponse(
    int id_usuario,
    string nombre,
    string correo,
    string? num_ficha,
    DateTimeOffset? primera_orientacion,
    DateTimeOffset? ultima_orientacion);

/// <summary>Orientación y su estado actual para el historial administrativo.</summary>
public sealed record AdminOrientacionResponse(
    int id_orientacion,
    DateTimeOffset fecha_hora,
    string motivo,
    string estado,
    string aprendiz,
    string? motivo_rechazo_cancelacion);

/// <summary>Publicación creada por un profesional psicosocial.</summary>
public sealed record AdminPublicacionResponse(
    int id_publicacion,
    string titulo,
    DateTimeOffset fecha_publicacion);

/// <summary>Métricas detalladas y actividad de un profesional psicosocial.</summary>
public sealed record AdminPsicosocialDetailResponse(
    int id_usuario,
    string nombre,
    string correo,
    string? documento,
    int aprendices_asignados,
    int orientaciones_realizadas,
    int orientaciones_rechazadas,
    int orientaciones_canceladas,
    int orientaciones_pendientes,
    IReadOnlyList<AdminOrientacionResponse> orientaciones,
    IReadOnlyList<AdminAprendizResponse> aprendices,
    IReadOnlyList<AdminPublicacionResponse> publicaciones);
