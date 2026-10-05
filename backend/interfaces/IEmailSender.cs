namespace WebApplication1.interfaces;

public interface IEmailSender
{
    Task SendVerificationCodeAsync(string email, string code, CancellationToken cancellationToken);
}
