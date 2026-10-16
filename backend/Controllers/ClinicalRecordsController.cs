using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.models;

namespace WebApplication1.Controllers;

[ApiController]
[Authorize]
[Route("api/clinical-records")]
public sealed class ClinicalRecordsController(serena context) : ControllerBase
{
    private const long MaximumPdfSize = 10 * 1024 * 1024;
    private static readonly HashSet<string> NoteTypes = ["Evolución", "Comentario", "Acuerdo"];

    [Authorize(Roles = "Aprendiz")]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var learnerId)) return Unauthorized();
        var record = await context.historial_clinico.AsNoTracking()
            .SingleOrDefaultAsync(item => item.id_usuario == learnerId, cancellationToken);
        return Ok(ToSummary(record));
    }
    
    [HttpGet("learners/{learnerId:int}/summary")]
    public async Task<IActionResult> GetLearnerSummary(int learnerId, CancellationToken cancellationToken)
    {
        if (!await CanReadLearnerRecordAsync(learnerId, cancellationToken)) return Forbid();
        var record = await context.historial_clinico.AsNoTracking()
            .SingleOrDefaultAsync(item => item.id_usuario == learnerId, cancellationToken);
        return Ok(ToSummary(record));
    }

    [Authorize(Roles = "Aprendiz")]
    [HttpPut("mine")]
    public async Task<IActionResult> UpdateMine(
        [FromBody] UpdateClinicalSummaryRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!TryGetUserId(out var learnerId)) return Unauthorized();
        var learner = await context.usuario.SingleOrDefaultAsync(
            item => item.id_usuario == learnerId && item.id_rol == 1,
            cancellationToken);
        if (learner is null) return NotFound();

        var conditions = request.condiciones
            .Select(value => value.Trim())
            .Where(value => value.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var joinedConditions = string.Join(", ", conditions);
        if (joinedConditions.Length > 300)
            return BadRequest(new { mensaje = "La lista de condiciones supera el límite permitido." });

        var record = await context.historial_clinico
            .SingleOrDefaultAsync(item => item.id_usuario == learnerId, cancellationToken);
        if (record is null)
        {
            record = new historial_clinico
            {
                id_usuario = learnerId,
                num_ficha = learner.num_ficha ?? string.Empty,
                fecha_apertura = DateTime.UtcNow,
                condiciones = joinedConditions,
                antecedentes = string.Empty
            };
            context.historial_clinico.Add(record);
        }
        else
        {
            record.condiciones = joinedConditions;
            record.num_ficha = learner.num_ficha ?? record.num_ficha;
        }

        await context.SaveChangesAsync(cancellationToken);
        return Ok(ToSummary(record));
    }

    [Authorize(Roles = "Aprendiz")]
    [HttpPost("mine/supports")]
    [RequestSizeLimit(MaximumPdfSize + 100_000)]
    public async Task<IActionResult> UploadSupport(
        [FromForm] UploadClinicalSupportRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!TryGetUserId(out var learnerId)) return Unauthorized();
        if (request.archivo.Length == 0 || request.archivo.Length > MaximumPdfSize)
            return BadRequest(new { mensaje = "El PDF debe pesar entre 1 byte y 10 MB." });
        if (!string.Equals(Path.GetExtension(request.archivo.FileName), ".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { mensaje = "Solo se permiten archivos PDF." });

        var content = new byte[5];
        await using (var stream = request.archivo.OpenReadStream())
        {
            var read = await stream.ReadAsync(content, cancellationToken);
            if (read != 5 || !content.AsSpan().SequenceEqual("%PDF-"u8))
                return BadRequest(new { mensaje = "El archivo no tiene una cabecera PDF válida." });
            stream.Position = 0;
            using var buffer = new MemoryStream((int)request.archivo.Length);
            await stream.CopyToAsync(buffer, cancellationToken);
            var support = new soporte_clinico
            {
                id_aprendiz = learnerId,
                nombre_archivo = Path.GetFileName(request.archivo.FileName.Replace('\\', '/')),
                descripcion = request.descripcion?.Trim(),
                archivo = buffer.ToArray(),
                fecha_carga = DateTime.UtcNow
            };
            context.soporte_clinico.Add(support);
            await context.SaveChangesAsync(cancellationToken);
            return CreatedAtAction(nameof(DownloadSupport), new { id = support.id_soporte }, ToSupportResponse(support));
        }
    }

    [HttpGet("learners/{learnerId:int}/supports")]
    public async Task<IActionResult> GetSupports(int learnerId, CancellationToken cancellationToken)
    {
        if (!await CanReadLearnerRecordAsync(learnerId, cancellationToken)) return Forbid();
        var supports = await context.soporte_clinico.AsNoTracking()
            .Where(item => item.id_aprendiz == learnerId)
            .OrderByDescending(item => item.fecha_carga)
            .ToListAsync(cancellationToken);
        return Ok(supports.Select(ToSupportResponse));
    }

    [HttpGet("supports/{id:int}/download")]
    public async Task<IActionResult> DownloadSupport(int id, CancellationToken cancellationToken)
    {
        var support = await context.soporte_clinico.AsNoTracking()
            .SingleOrDefaultAsync(item => item.id_soporte == id, cancellationToken);
        if (support is null) return NotFound();
        if (!await CanReadLearnerRecordAsync(support.id_aprendiz, cancellationToken)) return Forbid();
        return File(support.archivo, "application/pdf", support.nombre_archivo, enableRangeProcessing: true);
    }

    [HttpGet("learners/{learnerId:int}/notes")]
    public async Task<IActionResult> GetNotes(int learnerId, CancellationToken cancellationToken)
    {
        if (!await CanReadLearnerRecordAsync(learnerId, cancellationToken)) return Forbid();
        var notes = await context.anotacion_clinica.AsNoTracking()
            .Where(item => item.id_aprendiz == learnerId)
            .OrderByDescending(item => item.fecha)
            .Select(item => new ClinicalNoteResponse(
                item.id_anotacion,
                item.id_aprendiz,
                item.id_psicosocial,
                item.nombre_psicosocial,
                item.fecha,
                item.tipo,
                item.contenido))
            .ToListAsync(cancellationToken);
        return Ok(notes);
    }

    [Authorize(Roles = "Psicosocial")]
    [HttpPost("learners/{learnerId:int}/notes")]
    public async Task<IActionResult> AddNote(
        int learnerId,
        [FromBody] AddClinicalNoteRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (!NoteTypes.Contains(request.tipo))
            return BadRequest(new { mensaje = "El tipo de nota no es válido." });
        if (!TryGetUserId(out var professionalId)) return Unauthorized();
        if (!await CanProfessionalAccessLearnerAsync(professionalId, learnerId, cancellationToken)) return Forbid();

        var professionalName = await context.usuario.AsNoTracking()
            .Where(item => item.id_usuario == professionalId)
            .Select(item => item.nombre_usuario)
            .SingleAsync(cancellationToken);
        var note = new anotacion_clinica
        {
            id_aprendiz = learnerId,
            id_psicosocial = professionalId,
            nombre_psicosocial = professionalName,
            tipo = request.tipo,
            contenido = request.contenido.Trim(),
            fecha = DateTime.UtcNow
        };
        context.anotacion_clinica.Add(note);
        await context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetNotes), new { learnerId }, new ClinicalNoteResponse(
            note.id_anotacion,
            note.id_aprendiz,
            note.id_psicosocial,
            note.nombre_psicosocial,
            note.fecha,
            note.tipo,
            note.contenido));
    }

    private async Task<bool> CanReadLearnerRecordAsync(int learnerId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var callerId)) return false;
        if (User.IsInRole("Admin")) return true;
        if (User.IsInRole("Aprendiz")) return callerId == learnerId;
        return User.IsInRole("Psicosocial") &&
            await CanProfessionalAccessLearnerAsync(callerId, learnerId, cancellationToken);
    }

    private async Task<bool> CanProfessionalAccessLearnerAsync(
        int professionalId,
        int learnerId,
        CancellationToken cancellationToken)
    {
        var learner = await context.usuario.AsNoTracking()
            .Where(item => item.id_usuario == learnerId && item.id_rol == 1)
            .Select(item => new { item.id_usuario, item.id_ficha })
            .SingleOrDefaultAsync(cancellationToken);
        if (learner is null) return false;

        return await context.usuario_ficha.AnyAsync(item =>
                item.id_usuario == professionalId && item.estado && item.id_ficha == learner.id_ficha,
                cancellationToken) ||
            await context.cita.AnyAsync(item =>
                item.id_usuario_psicologo == professionalId && item.id_usuario_aprendiz == learnerId,
                cancellationToken);
    }

    private bool TryGetUserId(out int userId) =>
        int.TryParse(User.FindFirstValue("id_usuario"), out userId);

    private static ClinicalSummaryResponse ToSummary(historial_clinico? record) => new(
        record?.condiciones.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) ?? [],
        record?.fecha_apertura);

    private static ClinicalSupportResponse ToSupportResponse(soporte_clinico support) => new(
        support.id_soporte,
        support.id_aprendiz,
        support.nombre_archivo,
        support.descripcion,
        support.fecha_carga,
        support.archivo.Length);
}

public sealed record ClinicalSummaryResponse(IReadOnlyList<string> condiciones, DateTime? fecha_apertura);

public sealed record UpdateClinicalSummaryRequest([Required] IReadOnlyList<string> condiciones);

public sealed record UploadClinicalSupportRequest([Required] IFormFile archivo, string? descripcion);

public sealed record ClinicalSupportResponse(
    int id_soporte,
    int id_aprendiz,
    string nombre_archivo,
    string? descripcion,
    DateTime fecha_carga,
    int tamano_bytes);

public sealed record AddClinicalNoteRequest(
    [Required, StringLength(30)] string tipo,
    [Required, StringLength(4000)] string contenido);

public sealed record ClinicalNoteResponse(
    int id_anotacion,
    int id_aprendiz,
    int id_psicosocial,
    string nombre_psicologo,
    DateTime fecha,
    string tipo,
    string contenido);