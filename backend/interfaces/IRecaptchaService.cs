namespace WebApplication1.interfaces;

public interface IRecaptchaService
{
    Task<bool> VerifyAsync(string token, string expectedAction, string? remoteIp, CancellationToken cancellationToken);
}
