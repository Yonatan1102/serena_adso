namespace WebApplication1.DTOs;

/// <summary>Programa disponible para el registro de aprendices.</summary>
public sealed record ProgramaResponse(int id_programa, string nombre_programa);

/// <summary>Ficha activa asociada a un programa.</summary>
public sealed record FichaResponse(int id_ficha, string codigo_ficha, string programa, string jornada);
