using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs;
using WebApplication1.interfaces;

namespace WebApplication1.repositories;

public sealed class admin_repository(serena context) : IAdminRepository
{
    public async Task<IReadOnlyList<AdminPsicosocialResponse>> GetPsicosocialesAsync(
        string? search,
        CancellationToken cancellationToken)
    {
        var professionals = context.usuario
            .AsNoTracking()
            .Where(user => user.rol != null && EF.Functions.Like(user.rol.nombre_rol, "%psic%"));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            professionals = professionals.Where(user =>
                EF.Functions.Like(user.nombre_usuario, term) ||
                EF.Functions.Like(user.email, term) ||
                (user.documento != null && EF.Functions.Like(user.documento, term)));
        }

        var users = await professionals
            .OrderBy(user => user.nombre_usuario)
            .Select(user => new { user.id_usuario, user.nombre_usuario, user.email, user.documento, user.ultimo_acceso })
            .ToListAsync(cancellationToken);

        var ids = users.Select(user => user.id_usuario).ToArray();
        var assignments = await context.usuario_ficha
            .AsNoTracking()
            .Where(item => ids.Contains(item.id_usuario) && item.estado && item.ficha.estado)
            .Select(item => new { item.id_usuario, item.id_ficha })
            .ToListAsync(cancellationToken);
        var learnerRows = await GetLearnerFichaRowsAsync(assignments.Select(item => item.id_ficha).Distinct().ToArray(), cancellationToken);
        var appointments = await context.cita
            .AsNoTracking()
            .Where(item => ids.Contains(item.id_usuario_psicologo))
            .Select(item => new { item.id_usuario_psicologo, item.id_usuario_aprendiz, item.estado_cita })
            .ToListAsync(cancellationToken);

        var learnerIdsByProfessional = assignments
            .GroupBy(item => item.id_usuario)
            .ToDictionary(
                group => group.Key,
                group => learnerRows
                    .Where(learner => group.Any(assignment => assignment.id_ficha == learner.id_ficha))
                    .Select(learner => learner.id_usuario)
                    .Distinct()
                    .ToHashSet());

        var counts = appointments
            .GroupBy(item => item.id_usuario_psicologo)
            .ToDictionary(
                group => group.Key,
                group => new
                {
                    Total = group.Count(),
                    Completed = group.Count(item => item.estado_cita == "Realizada"),
                    ContactedLearners = group
                        .Where(item => item.estado_cita == "Realizada")
                        .Select(item => item.id_usuario_aprendiz)
                        .Distinct()
                        .Count()
                });

        return users.Select(user =>
        {
            counts.TryGetValue(user.id_usuario, out var count);
            learnerIdsByProfessional.TryGetValue(user.id_usuario, out var learnerIds);
            var assignedLearnerIds = learnerIds ?? [];
            var contactCount = count is null ? 0 : appointments
                .Where(item => item.id_usuario_psicologo == user.id_usuario && assignedLearnerIds.Contains(item.id_usuario_aprendiz))
                .Select(item => item.id_usuario_aprendiz)
                .Distinct()
                .Count();
            return new AdminPsicosocialResponse(
                user.id_usuario,
                user.nombre_usuario,
                user.email,
                user.documento,
                assignments.Count(item => item.id_usuario == user.id_usuario),
                assignedLearnerIds.Count,
                contactCount,
                count?.Completed ?? 0,
                count?.Total ?? 0,
                user.ultimo_acceso is null ? null : ToUtcOffset(user.ultimo_acceso.Value));
        }).ToArray();
    }

    public async Task<AdminPsicosocialDetailResponse?> GetPsicosocialDetailAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var professional = await context.usuario
            .AsNoTracking()
            .Where(user => user.id_usuario == id &&
                user.rol != null && EF.Functions.Like(user.rol.nombre_rol, "%psic%"))
            .Select(user => new { user.id_usuario, user.nombre_usuario, user.email, user.documento, user.ultimo_acceso })
            .FirstOrDefaultAsync(cancellationToken);

        if (professional is null)
            return null;

        var assignedFichas = await context.usuario_ficha
            .AsNoTracking()
            .Where(item => item.id_usuario == id && item.estado && item.ficha.estado)
            .OrderBy(item => item.ficha.codigo_ficha)
            .Select(item => new AdminFichaResponse(
                item.id_ficha,
                item.ficha.codigo_ficha,
                item.ficha.programa,
                item.ficha.centro,
                item.ficha.jornada,
                item.fecha_asignacion.HasValue ? ToUtcOffset(item.fecha_asignacion.Value) : null,
                0))
            .ToListAsync(cancellationToken);
        var fichaIds = assignedFichas.Select(item => item.id_ficha).Distinct().ToArray();
        var learnerRows = await GetLearnerFichaRowsAsync(fichaIds, cancellationToken);

        var appointments = await context.cita
            .AsNoTracking()
            .Include(item => item.id_usuario_aprendiz_navegacion)
            .Include(item => item.historial_citas)
            .Where(item => item.id_usuario_psicologo == id)
            .OrderByDescending(item => item.fecha_hora)
            .ToListAsync(cancellationToken);

        var learners = learnerRows
            .Select(learner =>
            {
                var learnerAppointments = appointments
                    .Where(item => item.id_usuario_aprendiz == learner.id_usuario)
                    .ToArray();
                var completedAppointments = learnerAppointments
                    .Where(item => item.estado_cita == "Realizada")
                    .ToArray();
                return new AdminAprendizResponse(
                    learner.id_usuario,
                    learner.nombre,
                    learner.correo,
                    learner.num_ficha,
                    learner.id_ficha,
                    learner.codigo_ficha,
                    completedAppointments.Length > 0,
                    learnerAppointments.Length,
                    completedAppointments.Length == 0 ? null : ToUtcOffset(completedAppointments.Max(item => item.fecha_hora)));
            })
            .OrderBy(item => item.codigo_ficha)
            .ThenBy(item => item.nombre)
            .ToArray();

        assignedFichas = assignedFichas.Select(ficha => ficha with
        {
            aprendices_asignados = learners.Count(learner => learner.id_ficha == ficha.id_ficha)
        }).ToList();

        var orientationHistory = appointments.Select(item =>
        {
            var reason = item.historial_citas
                .Where(history => history.estado_nuevo is "Cancelada" or "Rechazada")
                .OrderByDescending(history => history.fecha_cambio)
                .Select(history => history.motivo_cambio)
                .FirstOrDefault();

            return new AdminOrientacionResponse(
                item.id_cita,
                item.id_usuario_aprendiz,
                ToUtcOffset(item.fecha_hora),
                item.motivo ?? string.Empty,
                item.estado_cita,
                item.id_usuario_aprendiz_navegacion?.nombre_usuario ?? "Aprendiz",
                reason);
        }).ToArray();

        var publications = await context.publicaciones
            .AsNoTracking()
            .Where(item => item.id_usuario == id)
            .OrderByDescending(item => item.fecha_publicacion)
            .Select(item => new AdminPublicacionResponse(
                item.id_publicaciones,
                item.titulo,
                ToUtcOffset(item.fecha_publicacion)))
            .ToListAsync(cancellationToken);

        return new AdminPsicosocialDetailResponse(
            professional.id_usuario,
            professional.nombre_usuario,
            professional.email,
            professional.documento,
            professional.ultimo_acceso is null ? null : ToUtcOffset(professional.ultimo_acceso.Value),
            assignedFichas,
            learners.Length,
            appointments.Count(item => item.estado_cita == "Realizada"),
            appointments.Count(item => item.estado_cita == "Rechazada"),
            appointments.Count(item => item.estado_cita == "Cancelada"),
            appointments.Count(item => item.estado_cita == "Pendiente"),
            orientationHistory,
            learners,
            publications);
    }

    public async Task<AdminFichaResponse?> AssignFichaAsync(
        int psicosocialId,
        int fichaId,
        CancellationToken cancellationToken)
    {
        var professionalExists = await context.usuario.AnyAsync(
            user => user.id_usuario == psicosocialId && user.rol != null && EF.Functions.Like(user.rol.nombre_rol, "%psic%"),
            cancellationToken);
        var ficha = await context.ficha
            .Where(item => item.id_ficha == fichaId && item.estado)
            .Select(item => new { item.id_ficha, item.codigo_ficha, item.programa, item.centro, item.jornada })
            .FirstOrDefaultAsync(cancellationToken);
        if (!professionalExists || ficha is null) return null;

        var assignment = await context.usuario_ficha.FirstOrDefaultAsync(
            item => item.id_usuario == psicosocialId && item.id_ficha == fichaId,
            cancellationToken);
        if (assignment is null)
        {
            context.usuario_ficha.Add(new usuario_ficha
            {
                id_usuario = psicosocialId,
                id_ficha = fichaId,
                fecha_asignacion = DateTime.UtcNow,
                estado = true
            });
        }
        else
        {
            assignment.estado = true;
            assignment.fecha_asignacion = DateTime.UtcNow;
        }
        await context.SaveChangesAsync(cancellationToken);

        return new AdminFichaResponse(
            ficha.id_ficha,
            ficha.codigo_ficha,
            ficha.programa,
            ficha.centro,
            ficha.jornada,
            ToUtcOffset(DateTime.UtcNow),
            await CountLearnersForFichaAsync(fichaId, cancellationToken));
    }

    public async Task<bool> UnassignFichaAsync(int psicosocialId, int fichaId, CancellationToken cancellationToken)
    {
        var assignment = await context.usuario_ficha.FirstOrDefaultAsync(
            item => item.id_usuario == psicosocialId && item.id_ficha == fichaId && item.estado,
            cancellationToken);
        if (assignment is null) return false;
        assignment.estado = false;
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<List<AdminLearnerFichaRow>> GetLearnerFichaRowsAsync(int[] fichaIds, CancellationToken cancellationToken)
    {
        if (fichaIds.Length == 0) return [];

        var directAssignments = await context.usuario
            .AsNoTracking()
            .Where(user => user.id_rol == 1 && user.id_ficha.HasValue && fichaIds.Contains(user.id_ficha.Value))
            .Select(user => new AdminLearnerFichaRow(
                user.id_usuario,
                user.nombre_usuario,
                user.email,
                user.num_ficha,
                user.id_ficha!.Value,
                user.ficha!.codigo_ficha))
            .ToListAsync(cancellationToken);

        var linkedAssignments = await context.usuario_ficha
            .AsNoTracking()
            .Where(item => item.estado && fichaIds.Contains(item.id_ficha) && item.usuario.id_rol == 1)
            .Select(item => new AdminLearnerFichaRow(
                item.id_usuario,
                item.usuario.nombre_usuario,
                item.usuario.email,
                item.usuario.num_ficha,
                item.id_ficha,
                item.ficha.codigo_ficha))
            .ToListAsync(cancellationToken);

        return directAssignments.Concat(linkedAssignments)
            .DistinctBy(item => new { item.id_usuario, item.id_ficha })
            .ToList();
    }

    private async Task<int> CountLearnersForFichaAsync(int fichaId, CancellationToken cancellationToken) =>
        await context.usuario.CountAsync(
            user => user.id_rol == 1 &&
                (user.id_ficha == fichaId || context.usuario_ficha.Any(item =>
                    item.id_usuario == user.id_usuario && item.id_ficha == fichaId && item.estado)),
            cancellationToken);

    private sealed record AdminLearnerFichaRow(
        int id_usuario,
        string nombre,
        string correo,
        string? num_ficha,
        int id_ficha,
        string codigo_ficha);

    private static DateTimeOffset ToUtcOffset(DateTime value) =>
        new(DateTime.SpecifyKind(value, DateTimeKind.Utc));
}
