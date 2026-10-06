using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApplication1.models;

namespace WebApplication1.services;

public static class DemoDataSeeder
{
    private const string DemoPassword = "Aa12345*";
    private const string ProgramName = "Análisis y Desarrollo de Software";

    public static void Seed(serena context)
    {
        var program = context.programa.Single(item => item.nombre_programa == ProgramName);
        var firstCohort = context.ficha.Single(item => item.id_ficha == 3288046);
        var secondCohort = context.ficha.SingleOrDefault(item => item.id_ficha == 3288047);
        if (secondCohort is null)
        {
            secondCohort = new ficha
            {
                id_ficha = 3288047,
                codigo_ficha = "3288047",
                programa = ProgramName,
                id_programa = program.id_programa,
                centro = "CMTC",
                jornada = "Diurna",
                estado = true
            };
            context.ficha.Add(secondCohort);
            context.SaveChanges();
        }

        var learnerRoleId = context.rol.Single(item => item.nombre_rol == "Aprendiz").id_rol;
        var professionalRoleId = context.rol.Single(item => item.nombre_rol == "Psicosocial").id_rol;
        var adminRoleId = context.rol.Single(item => item.nombre_rol == "Admin").id_rol;

        var admin = EnsureUser(context, "Administración SERENA", "admin.demo@sena.edu.co", adminRoleId);
        var laura = EnsureUser(context, "Laura Martínez", "laura.martinez@sena.edu.co", professionalRoleId);
        var carlos = EnsureUser(context, "Carlos Pardo", "carlos.pardo@sena.edu.co", professionalRoleId);
        var aprendiz1 = EnsureUser(context, "Valentina Rojas", "valentina.rojas@soy.sena.edu.co", learnerRoleId, firstCohort);
        var aprendiz2 = EnsureUser(context, "Mateo Cárdenas", "mateo.cardenas@soy.sena.edu.co", learnerRoleId, firstCohort);
        var aprendiz3 = EnsureUser(context, "Sara Gómez", "sara.gomez@soy.sena.edu.co", learnerRoleId, secondCohort);
        var aprendiz4 = EnsureUser(context, "Andrés Torres", "andres.torres@soy.sena.edu.co", learnerRoleId, secondCohort);
        context.SaveChanges();

        EnsureAssignment(context, laura.id_usuario, firstCohort.id_ficha);
        EnsureAssignment(context, carlos.id_usuario, secondCohort.id_ficha);
        EnsureAppointment(context, aprendiz1.id_usuario, laura.id_usuario, "Orientación inicial de bienestar", "Realizada", -4);
        EnsureAppointment(context, aprendiz2.id_usuario, laura.id_usuario, "Seguimiento de adaptación formativa", "Pendiente", 3);
        EnsureAppointment(context, aprendiz3.id_usuario, carlos.id_usuario, "Acompañamiento psicosocial", "Realizada", -2);
        EnsureAppointment(context, aprendiz4.id_usuario, carlos.id_usuario, "Solicitud de orientación", "Pendiente", 2);
        EnsurePublication(context, laura.id_usuario, "Pausas activas para el bienestar", "Recomendaciones breves para cuidar el bienestar durante la jornada formativa.");
        EnsurePublication(context, carlos.id_usuario, "Herramientas para organizar el estudio", "Una rutina flexible y descansos regulares ayudan a sostener el proceso de aprendizaje.");
        context.SaveChanges();
    }

    private static usuario EnsureUser(serena context, string name, string email, int roleId, ficha? cohort = null)
    {
        var existing = context.usuario.SingleOrDefault(item => item.email == email);
        if (existing is not null)
            return existing;

        var user = new usuario
        {
            nombre_usuario = name,
            email = email,
            contrasena = DemoPassword,
            id_rol = roleId,
            id_ficha = cohort?.id_ficha,
            num_ficha = cohort?.codigo_ficha,
            centro = "CMTC",
            programa_formacion = cohort?.programa,
            acepta_tratamiento_datos = true,
            fecha_consentimiento = DateTime.UtcNow,
            email_verificado = true
        };
        user.contrasena = new PasswordHasher<usuario>().HashPassword(user, DemoPassword);
        context.usuario.Add(user);
        return user;
    }

    private static void EnsureAssignment(serena context, int userId, int cohortId)
    {
        var assignment = context.usuario_ficha.SingleOrDefault(item => item.id_usuario == userId && item.id_ficha == cohortId);
        if (assignment is null)
        {
            context.usuario_ficha.Add(new usuario_ficha
            {
                id_usuario = userId,
                id_ficha = cohortId,
                fecha_asignacion = DateTime.UtcNow,
                estado = true
            });
        }
        else
        {
            assignment.estado = true;
        }
    }

    private static void EnsureAppointment(serena context, int learnerId, int professionalId, string reason, string status, int daysFromNow)
    {
        if (context.cita.Any(item => item.id_usuario_aprendiz == learnerId &&
            item.id_usuario_psicologo == professionalId && item.motivo == reason))
            return;

        context.cita.Add(new cita
        {
            fecha_hora = DateTime.UtcNow.AddDays(daysFromNow),
            motivo = reason,
            estado_cita = status,
            id_usuario_aprendiz = learnerId,
            id_usuario_psicologo = professionalId
        });
    }

    private static void EnsurePublication(serena context, int userId, string title, string content)
    {
        if (context.publicaciones.Any(item => item.id_usuario == userId && item.titulo == title))
            return;

        context.publicaciones.Add(new publicaciones
        {
            titulo = title,
            contenido = content,
            fecha_publicacion = DateTime.UtcNow,
            id_usuario = userId,
            id_comunidad = "s/CMTC",
            etiqueta = "Bienestar",
            votos = 0,
            comentarios_count = 0
        });
    }
}