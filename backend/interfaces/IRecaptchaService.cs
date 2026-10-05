namespace WebApplication1.interfaces;

public interface IRecaptchaService
{
    Task<bool> VerifyAsync(string token, string? remoteIp, CancellationToken cancellationToken);
}
