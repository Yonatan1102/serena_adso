using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.services;

public sealed class EmailVerificationService(
    serena context,
    IEmailSender emailSender,
    ILogger<EmailVerificationService> logger) : IEmailVerificationService
{
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan ResendDelay = TimeSpan.FromMinutes(1);
    private const int MaximumAttempts = 5;

    public async Task<bool> IssueCodeAsync(usuario user, CancellationToken cancellationToken) =>
        await IssueCodeForUserAsync(user, cancellationToken);

    public async Task<bool> ResendCodeAsync(string email, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await context.usuario
            .FirstOrDefaultAsync(item => item.email.ToLower() == normalizedEmail, cancellationToken);
        if (user is null || user.email_verificado)
            return false;

        return await IssueCodeForUserAsync(user, cancellationToken);
    }

    public async Task<bool> VerifyCodeAsync(string email, string code, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var verification = await context.verificacion_correo
            .Include(item => item.usuario)
            .FirstOrDefaultAsync(item => item.usuario.email.ToLower() == normalizedEmail, cancellationToken);
        if (verification is null || verification.usuario.email_verificado || verification.intentos >= MaximumAttempts)
            return false;

        if (verification.expira_en <= DateTimeOffset.UtcNow)
        {
            context.verificacion_correo.Remove(verification);
            await context.SaveChangesAsync(cancellationToken);
            return false;
        }

        var hasher = new PasswordHasher<string>();
        var result = hasher.VerifyHashedPassword(
            normalizedEmail,
            verification.codigo_hash,
            code);
        if (result == PasswordVerificationResult.Failed)
        {
            verification.intentos++;
            await context.SaveChangesAsync(cancellationToken);
            return false;
        }

        verification.usuario.email_verificado = true;
        context.verificacion_correo.Remove(verification);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<bool> IssueCodeForUserAsync(usuario user, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var verification = await context.verificacion_correo
            .FirstOrDefaultAsync(item => item.id_usuario == user.id_usuario, cancellationToken);
        if (verification is not null && verification.enviado_en > now - ResendDelay)
            return false;

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var normalizedEmail = user.email.Trim().ToLowerInvariant();
        var hasher = new PasswordHasher<string>();
        var codeHash = hasher.HashPassword(normalizedEmail, code);

        if (verification is null)
        {
            verification = new verificacion_correo { id_usuario = user.id_usuario };
            context.verificacion_correo.Add(verification);
        }

        verification.codigo_hash = codeHash;
        verification.enviado_en = now;
        verification.expira_en = now.Add(CodeLifetime);
        verification.intentos = 0;
        await context.SaveChangesAsync(cancellationToken);

        try
        {
            await emailSender.SendVerificationCodeAsync(normalizedEmail, code, cancellationToken);
            return true;
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogError(exception, "No se pudo enviar código de verificación a {Email}.", normalizedEmail);
            context.verificacion_correo.Remove(verification);
            await context.SaveChangesAsync(cancellationToken);
            throw;
        }
    }
}
