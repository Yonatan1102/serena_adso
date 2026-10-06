using System.Net;
using System.Net.Mail;
using System.Text;
using WebApplication1.interfaces;

namespace WebApplication1.services;

public sealed class SmtpEmailSender(IConfiguration configuration) : IEmailSender
{
    public async Task SendVerificationCodeAsync(string email, string code, string purpose, CancellationToken cancellationToken)
    {
        var host = configuration["Email:Smtp:Host"];
        var from = configuration["Email:Smtp:From"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from) ||
            !int.TryParse(configuration["Email:Smtp:Port"], out var port) ||
            port is < 1 or > 65535)
            throw new InvalidOperationException("El servicio SMTP no está configurado correctamente.");

        using var message = new MailMessage(from, email)
        {
            Subject = "Código de seguridad de SERENA",
            Body = $"Tu código de seguridad es {code}. Vence en 10 minutos. Si no solicitaste esta acción ({purpose}), ignora este mensaje.",
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8,
            IsBodyHtml = false
        };
        using var client = new SmtpClient(host, port)
        {
            EnableSsl = bool.TryParse(configuration["Email:Smtp:EnableSsl"], out var enableSsl) && enableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 15000
        };

        var username = configuration["Email:Smtp:Username"];
        var password = configuration["Email:Smtp:Password"];
        if (!string.IsNullOrWhiteSpace(username) || !string.IsNullOrWhiteSpace(password))
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("Configura tanto Email:Smtp:Username como Email:Smtp:Password.");
            client.Credentials = new NetworkCredential(username, password);
        }

        await client.SendMailAsync(message, cancellationToken);
    }
}
