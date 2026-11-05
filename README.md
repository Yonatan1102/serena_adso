# WebApplication1


REPORTE CONSOLIDADO DE OBSERVACIONES DE SONARQUBE

================================================================================
1. ALTA PRIORIDAD (HIGH SEVERITY)
================================================================================

[SEGURIDAD]
- Frontend Container
  Archivo: frontend/Dockerfile (Línea 6)
  Regla: CWE / Dockerfile
  Detalle: Copying recursively might inadvertently add sensitive data to the container. Make sure it is safe here.

[FIABILIDAD]
- Estilos CSS
  Archivo: coverage/report.css (Líneas 44, 614)
  Detalle: Overridden property "background-color" by shorthand "background".


================================================================================
2. PRIORIDAD MEDIA (MEDIUM SEVERITY)
================================================================================

--- [A] SEGURIDAD (SECURITY) ---

* Credenciales o Passwords Hardcoded:
  - backend/services/DemoDataSeeder.cs (Línea 9, Esfuerzo: 30 min)
    Detalle: "password" detected here, make sure this is not a hard-coded credential.
  - backend/services/EmailVerificationService.cs (Línea 19, Esfuerzo: 30 min)
    Detalle: "password" detected here, make sure this is not a hard-coded credential.

* Generador de Números Pseudoaleatorios (Criptografía):
  - frontend/src/components/FormulariosView.tsx (Línea 189, Esfuerzo: 10 min)
    Detalle: Make sure that using this pseudorandom number generator is safe here.
  - frontend/src/services/serena-api.service.ts (Línea 1560, Esfuerzo: 10 min)
    Detalle: Make sure that using this pseudorandom number generator is safe here.


--- [B] FIABILIDAD (RELIABILITY) ---

* Prevención de Under-posting en ASP.NET Controllers (Propiedades de tipo valor):
  Mensaje: Value type property used as input in a controller action should be nullable, required or annotated with JsonRequiredAttribute to avoid under-posting.
  
  Controladores afectos:
  - backend/Controllers/AdminController.cs (Línea 50)
  - backend/Controllers/diario_controller.cs (Línea 106)
  - backend/Controllers/disponibilidad_controller.cs (Líneas 129, 130, 131)
  - backend/Controllers/login_controller.cs (Línea 380)

  Modelos afectos:
  - backend/models/cita.cs (Líneas 15, 19, 31, 34)
  - backend/models/diario.cs (Líneas 12, 15, 19, 22)
  - backend/models/emergencia.cs (Líneas 13, 16, 20)
  - backend/models/estado_animo_usuario.cs (Líneas 11, 15, 19, 23)
  - backend/models/estado_de_animo.cs (Línea 13)
  - backend/models/ficha.cs (Líneas 12, 25)
  - backend/models/formulario.cs (Líneas 10, 17)
  - backend/models/historial_cita.cs (Líneas 13, 16, 23)
  - backend/models/historial_clinico.cs (Líneas 12, 14, 20)
  - backend/models/menu.cs (Línea 10)
  - backend/models/menu_rol.cs (Líneas 10, 13, 17)
  - backend/models/programa.cs (Línea 12)
  - backend/models/publicaciones.cs (Líneas 11, 22, 25, 36, 39)
  - backend/models/rol.cs (Línea 12)
  - backend/models/usuario.cs (Líneas 10, 33, 52, 61)
  - backend/models/usuario_ficha.cs (Líneas 11, 15, 19)

* Métodos asíncronos en backend sin Await adecuado (backend/Program.cs):
  - Línea 113: Await MigrateAsync instead.
  - Línea 117: Await AnyAsync instead.
  - Líneas 120, 130, 146, 155, 182: Await SaveChangesAsync instead.
  - Líneas 125, 133, 169: Await SingleOrDefaultAsync instead.
  - Línea 168: Await SingleAsync instead.
  - Línea 216: Await RunAsync instead.

* Manejo inadecuado de Promesas en Frontend:
  - frontend/src/components/BackendIntegrationGuideModal.tsx (Línea 30)
  - frontend/src/components/HomeAprendiz.tsx (Línea 123)
  - frontend/src/components/HomePsicologo.tsx (Línea 129)
  Detalle: Promises must be awaited, end with a call to .catch, end with .then with a rejection handler or be marked with void.

* Lógica condicional redundante:
  - frontend/src/components/Header.tsx (Línea 98)
  - frontend/src/components/HomeAprendiz.tsx (Línea 162)
  Detalle: This conditional operation returns the same value whether the condition is "true" or "false".


--- [C] ACCESIBILIDAD (WCAG 2.A - FRONTEND / COBERTURA) ---

* Asociación de etiquetas <label> a controles de formulario:
  - frontend/src/components/CitasView.tsx (Líneas 221, 243, 258, 285)
  - frontend/src/components/CrearPublicacionModal.tsx (Líneas 73, 120, 137, 151, 168)
  - frontend/src/components/CrearSubComunidadModal.tsx (Líneas 78, 95)
  - frontend/src/components/DiarioView.tsx (Línea 145: sin control asociable / Línea 178: sin texto accesible)
  - frontend/src/components/EstadoDeAnimoView.tsx (Líneas 363, 388)
  - frontend/src/components/HomePsicologo.tsx (Líneas 672, 689)

* Elementos Interactivos y Accesibilidad:
  - frontend/src/components/DisponibilidadCard.tsx (Línea 84): Add an explicit "type" attribute to this button.
  - frontend/src/components/ExpedienteClinicoModal.tsx (Línea 697): Remove "autoFocus" attribute to improve usability/accessibility.
  - frontend/src/components/HomeAprendiz.tsx (Línea 170)
  - frontend/src/components/HomePsicologo.tsx (Línea 377)
  - frontend/src/components/SidebarLeft.tsx (Líneas 380, 426)
    Detalle: Avoid non-native interactive elements without ARIA roles/keyboard support.

* Tablas y Lenguaje en reportes HTML (coverage/*.html):
  - Faltan atributos lang u xml:lang en <html> o <body> en los reportes de cobertura.
  - Faltan atributos id/scope o encabezados <th> en las tablas de coverage/index.html.


================================================================================
3. BAJA PRIORIDAD / MANTENIBILIDAD (LOW SEVERITY & INFO)
================================================================================

* Configuración Docker / Usuario Root:
  - backend/Dockerfile (Línea 10): Image runs with "root" or "containerAdministrator" as default user.
  - frontend/Dockerfile (Línea 1): "node" image runs with "root" as default user.

* Protocolos Inseguros (HTTP / SSL):
  - backend/Program.cs (Líneas 92, 93, 96, 97): Using http protocol is insecure. Use https instead.
  - backend/services/SmtpEmailSender.cs (Línea 27): EnableSsl should be set to true.

* Convenciones de Código C# (Roslyn):
  - Nombres de clases en minúsculas (deben ser PascalCase):
    DatabaseService.cs, cita.cs, diario.cs, disponibilidad.cs, emergencia.cs,
    ficha.cs, formulario.cs, menu.cs, programa.cs, publicaciones.cs, rol.cs, usuario.cs.
  
  - Optimización de métodos:
    * backend/Controllers/login_controller.cs (Línea 183): Cambiar tipo de retorno de CrearRespuestaLogin a OkObjectResult.
    * backend/DatabaseService.cs (Línea 39): El miembro EntityConfiguration se puede marcar como static.
    * backend/services/EmailVerificationService.cs (Líneas 28, 63, 78): Utilizar string.Equals(..., StringComparison.OrdinalIgnoreCase).