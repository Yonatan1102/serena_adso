using System.Net.Http.Json;
using WebApplication1.interfaces;

namespace WebApplication1.services;

public sealed class RecaptchaService(HttpClient httpClient, IConfiguration configuration) : IRecaptchaService
{
    private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    public async Task<bool> VerifyAsync(string token, string? remoteIp, CancellationToken cancellationToken)
    {
        var secretKey = configuration["RecaptchaSettings:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey) || string.IsNullOrWhiteSpace(token))
            return false;

        var values = new Dictionary<string, string>
        {
            ["secret"] = secretKey,
            ["response"] = token
        };
        if (!string.IsNullOrWhiteSpace(remoteIp))
            values["remoteip"] = remoteIp;

        using var response = await httpClient.PostAsync(
            VerifyUrl,
            new FormUrlEncodedContent(values),
            cancellationToken);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<RecaptchaVerificationResponse>(
            cancellationToken: cancellationToken);
        return result?.success == true;
    }

    private sealed record RecaptchaVerificationResponse(bool success);
}
