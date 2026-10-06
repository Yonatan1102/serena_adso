namespace WebApplication1.interfaces;

public interface IEmailSender
{
    Task SendVerificationCodeAsync(string email, string code, string purpose, CancellationToken cancellationToken);
}
