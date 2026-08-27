# Auditoría técnica SERENA

## 1. Estado general

| Área | Estado | Evidencia |
|---|---|---|
| BUILD | PASS con 9 advertencias | `dotnet build --no-restore` |
| API | NO VERIFICADO | Falta servidor SQL/cadena válida para arrancar |
| DATABASE | NO VERIFICADO | `ConnectionStrings:DefaultConnection` debe configurarse |
| CONTROLLERS | PASS estructural | Rutas explícitas y DI corregida; integración pendiente |
| REPOSITORIES | PASS estático | CRUD EF Core implementado; requiere BD para ejecución |
| INTERFACES | PASS | Contratos alineados con repositorios |
| AUTHENTICATION | PARCIAL | Login y hash de contraseña; sin JWT |
| AUTHORIZATION | FAIL / DECISIÓN REQUERIDA | No existe middleware ni políticas de roles |
| SWAGGER | NO VERIFICADO | Configurado para Development, arranque depende de BD |
| POSTMAN READY | PARCIAL | Rutas y cuerpos listos; falta conexión real |

## 2. Hallazgos y correcciones

| Archivo | Problema | Gravedad | Corrección |
|---|---|---|---|
| `Controllers/emergencia_controller.cs` | Llave faltante, rutas duplicadas y respuestas ficticias | Crítica | Controlador real conectado a `Iemergencia` |
| `Controllers/usuario_controller.cs` | Constructor roto, variables inexistentes y dos POST iguales | Crítica | CRUD único, DI correcta, validación y códigos REST |
| `interfaces/Ilogin.cs` | Contrato copiado de historial clínico | Crítica | Contrato de búsqueda, registro y validación |
| `repositories/*` | Múltiples `NotImplementedException` | Crítica | Operaciones EF Core implementadas en repositorios principales |
| `models/cita.cs`, `models/historial_cita.cs` | Tablas `citas`/`historial_citas` no coincidían con DbContext | Alta | Alineadas a `cita`/`historial_cita` |
| `Program.cs` | Login no registrado, conexión nula y CORS ausente | Alta | DI, validación de configuración y CORS de Development |
| `Controllers/formulario.cs` | Endpoints sólo devolvían texto | Alta | CRUD conectado a repository |
| `Controllers/*` | Rutas dependían de nombres heredados con `_` | Media | Rutas explícitas estables |
| `usuario` | Contraseña inexistente y riesgo de exponerla | Crítica | Campo configurado, hash `PasswordHasher`, respuesta protegida |

## 3. Correcciones realizadas

Se modificaron `Program.cs`, `DatabaseService.cs`, los modelos con inconsistencias de tabla/nulabilidad, contratos de interfaces de usuarios, login y CRUD, repositorios de citas, diario, emergencias, estado de ánimo, formularios, historiales, publicaciones y roles, y controladores de usuarios, login, citas, diario, emergencias, estado de ánimo, formularios, historiales, publicaciones, roles, menú y menú-rol. Se añadió esta guía.

## 4. Matriz de endpoints

Base local: `http://localhost:5185` (perfil `http`) o `https://localhost:7069` (perfil `https`). Header JSON: `Content-Type: application/json`.

| Método | Endpoint | Función | Auth | Estado |
|---|---|---|---|---|
| GET | `/api/usuario` | Listar usuarios | No implementada | 200 |
| GET | `/api/usuario/{id}` | Usuario | No implementada | 200/404 |
| POST | `/api/usuario` | Crear usuario | No implementada | 201/400/409 |
| PUT | `/api/usuario/{id}` | Actualizar usuario | No implementada | 200/400/404 |
| DELETE | `/api/usuario/{id}` | Eliminar usuario | No implementada | 204/404 |
| POST | `/api/login/registrar` | Registro | No implementada | 201/400/409 |
| POST | `/api/login` | Credenciales | No implementada | 200/401 |
| GET/POST | `/api/cita`, `/api/cita/agendar` | Citas | No implementada | 200/201 |
| GET | `/api/cita/{id}` | Cita | No implementada | 200/404 |
| PUT | `/api/cita` | Modificar cita | No implementada | 200/404 |
| DELETE | `/api/cita/{id}` | Cancelar, no borrar | No implementada | 204/404 |
| GET/POST | `/api/diario`, `/api/diario/crear` | Diario | No implementada | 200/201 |
| GET/PUT | `/api/diario/{id}`, `/api/diario` | Diario | No implementada | 200/404 |
| GET/POST/PUT | `/api/estado-animo` | Estado de ánimo | No implementada | 200/201 |
| GET/POST/PUT | `/api/emergencia` | Emergencia | No implementada | 200/201 |
| GET/POST/PUT/DELETE | `/api/formulario` | Formularios | No implementada | 200/201/204 |
| GET/POST/PUT | `/api/historial-cita` | Historial de cita | No implementada | 200/201 |
| GET/POST/PUT | `/api/historial-clinico` | Historia clínica | No implementada | 200/201 |
| GET/POST/PUT/DELETE | `/api/publicaciones` | Publicaciones | No implementada | 200/201/204 |
| GET/POST/PUT/DELETE | `/api/rol` | Roles | No implementada | 200/201/204 |
| GET | `/api/menu` | Menús | No implementada | 200 |
| GET | `/api/menu-rol` | Relaciones rol-menú | No implementada | 200 |

No se añadió DELETE a diarios, estados de ánimo, emergencias ni historiales: son datos potencialmente sensibles/históricos y requieren decisión de retención o borrado lógico.

## 5. Endpoints faltantes

Se implementaron los CRUD de usuarios, citas, formularios, publicaciones y roles, además de los repositorios de lectura/escritura de módulos principales. Faltan filtros por usuario (`GET ...?id_usuario=`), endpoints de agenda y permisos, y DTOs de creación separados de entidades. Son mejoras recomendadas, no se inventó una regla de negocio.

## 6. Arquitectura

Actualmente es una Web API monolítica modular organizada por capas: un proyecto, un proceso, un `DbContext` y una base de datos. Las carpetas no constituyen microservicios reales. Una evolución posible sería separar Auth/User, Appointment, Diary, Mood, Emergency, Content y Clinical History, cada uno con despliegue, contrato y persistencia propios. No se hizo esa migración para no destruir el funcionamiento actual.

## 7. Seguridad

Se corrigió el almacenamiento nuevo de contraseñas para usar hash y no se devuelve la contraseña. Persisten riesgos importantes: no hay JWT, autorización ni aislamiento por usuario para datos clínicos; los GET son públicos y las entidades se reciben directamente en POST/PUT. Requiere decisión sobre claims, roles y política de acceso. La cadena de conexión no se incluye con credenciales; debe llegar por configuración o `SERENA_CONNECTION_STRING`.

## 8. Guía Postman

1. Configure `SERENA_CONNECTION_STRING` o `ConnectionStrings:DefaultConnection` y confirme que la base tenga las columnas, especialmente `contrasena`.
2. GET `/swagger` para comprobar que la API arrancó.
3. POST `/api/usuario` o `/api/login/registrar`:
   `{ "nombre_usuario":"Camilo", "email":"camilo@gmail.com", "contrasena":"123456", "id_rol":1 }` -> 201. Repetir email -> 409; omitir campos -> 400.
4. POST `/api/login`:
   `{ "correo":"camilo@gmail.com", "contrasena":"123456" }` -> 200. Contraseña incorrecta -> 401.
5. GET `/api/usuario/{id}` -> 200/404. La contraseña debe aparecer como `[protegida]`.
6. POST `/api/cita/agendar` con fecha ISO, motivo, estado y usuarios -> 201; GET/PUT `/api/cita` -> 200; DELETE `/api/cita/{id}` cancela -> 204.
7. POST `/api/diario/crear` con `id_usuario`, `contenido`, `fecha_apertura`, `compartir_sp`; GET y PUT -> 200/201.
8. POST/PUT `/api/estado-animo` con `nombre_estado`, `id_usuario`, `fecha_estado`.
9. POST/PUT `/api/emergencia` con `descripcion`, `id_usuario`, `fecha_emergencia`.
10. POST/PUT/DELETE `/api/formulario` con `nombre_formulario`, `id_usuario`.
11. POST/PUT y GET `/api/historial-cita` y `/api/historial-clinico`; no DELETE.
12. POST/PUT/DELETE `/api/publicaciones` y GET por id.
13. GET/POST/PUT/DELETE `/api/rol`; GET `/api/menu` y `/api/menu-rol`.
14. Casos negativos comunes: JSON inválido -> 400, ID inexistente -> 404, campos requeridos ausentes -> 400. Un usuario no autorizado no puede probarse como 403 hasta implementar JWT/policies.

## 9. Checklist final

- [x] Compila correctamente (con advertencias de nombres heredados)
- [ ] Base de datos conecta (NO VERIFICADO)
- [x] Dependency Injection compila y contratos están registrados
- [x] Controllers principales conectados
- [x] Interfaces coinciden con repositories
- [x] Repositories principales implementados
- [ ] GET/POST/PUT/DELETE probados contra BD (NO VERIFICADO)
- [x] Login y contraseñas protegidas estáticamente
- [ ] JWT implementado (DECISIÓN REQUERIDA)
- [ ] Roles/autorización funcionan (DECISIÓN REQUERIDA)
- [x] Validaciones básicas y códigos HTTP
- [x] Sin SQL concatenado; EF Core parametriza consultas
- [x] CORS configurable para Development
- [ ] Swagger ejecutado (NO VERIFICADO por falta de BD)
- [x] API preparada para Postman
- [ ] Sin advertencias (queda limpieza de nombres heredados)
