# WebApplication1

## Configuración local y seguridad

La API requiere SQL Server y .NET 8. Para Compose, copia `.env.example` a `.env` y reemplaza los valores de ejemplo por secretos propios. Configura juntas `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD` para crear el primer administrador directamente en la BD; la contraseña debe tener al menos 16 caracteres y se guarda hasheada. Retira ambas variables después del primer inicio:

```sh
cp .env.example .env
docker compose up -d --build
```

`JWT_SIGNING_KEY` debe contener al menos 32 bytes aleatorios. Los tokens son JWT firmados con HMAC-SHA256; en producción, la API y el frontend deben servirse exclusivamente sobre HTTPS. Los JWT no se cifran porque son credenciales portadoras. El frontend los conserva únicamente en memoria, nunca en `localStorage` o `sessionStorage`.

La clave pública reCAPTCHA v2 se mantiene en el frontend; `RECAPTCHA_SECRET_KEY` y las credenciales SMTP son configuración privada del backend. Sin secretos válidos, la verificación CAPTCHA falla de forma cerrada y el registro no puede completar el envío del OTP.

SMTP se configura mediante `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` y `SMTP_ENABLE_SSL`. Para Gmail usa `smtp.gmail.com`, STARTTLS por el puerto 587 y una contraseña de aplicación; la contraseña normal de Google no autentica SMTP. Al registrar una cuenta se envía un OTP de seis dígitos, se persiste solo su hash con vencimiento de diez minutos y se limita la verificación a cinco intentos. El endpoint de reenvío aplica intervalo mínimo y CAPTCHA. La cuenta no inicia sesión hasta verificar el correo.

Los aprendices solo pueden registrarse con `@soy.sena.edu.co`; los profesionales psicosociales con `@sena.edu.co`. El primer administrador puede aprovisionarse una sola vez con `ADMIN_BOOTSTRAP_EMAIL` y un `ADMIN_BOOTSTRAP_PASSWORD` de al menos 16 caracteres. El rol Admin es de solo lectura para las rutas API y la vista web. Retira las variables de aprovisionamiento después del primer inicio.

Aplica las migraciones de EF Core al desplegar la API. Las solicitudes de registro deben incluir `acepta_tratamiento_datos: true` y un token reCAPTCHA; el login y las solicitudes de orientación también requieren un token válido. Los ejemplos de contratos están en [`backend/WebApplication1.http`](./backend/WebApplication1.http).

El formulario ya no solicita sede ni centro: los aprendices seleccionan un programa y solo ven las fichas activas asociadas. Los IDs de ficha son asignados manualmente y no usan identity.

## Disponibilidad y administración

Los horarios se mantienen como franjas recurrentes por día de semana. Confirmar una orientación ocupa la franja dentro de la misma transacción; rechazarla o cancelarla puede liberarla. Los endpoints de escritura y consulta personal requieren JWT; las métricas administrativas requieren el rol `Admin`.

El directorio y detalle de métricas administrativas permiten descargar CSV. Los profesionales psicosociales pueden exportar a PDF el historial de orientaciones por mes actual, últimos tres meses, semestre o rango seleccionable de uno a seis meses. En el esquema actual, “aprendices vinculados” se calcula a partir del historial de orientaciones y los informes/actas se muestran a partir de publicaciones existentes.

## Sesión del frontend

Los datos operativos de compatibilidad del frontend se mantienen en un caché volátil cifrado con AES-GCM y una clave aleatoria solo en memoria; no se guardan datos sensibles en `localStorage` ni `sessionStorage`. La sesión y la clave se eliminan/rotan al cerrar sesión y al vencer el JWT. El único valor persistido en Web Storage es la preferencia visual del tema.