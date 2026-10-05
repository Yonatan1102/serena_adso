namespace WebApplication1.interfaces;

public interface IEmailVerificationService
{
    Task<bool> IssueCodeAsync(models.usuario user, CancellationToken cancellationToken);
    Task<bool> VerifyCodeAsync(string email, string code, CancellationToken cancellationToken);
    Task<bool> ResendCodeAsync(string email, CancellationToken cancellationToken);
}
