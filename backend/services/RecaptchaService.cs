using System.Net.Http.Json;
using System.Text.Json.Serialization;
using WebApplication1.interfaces;

namespace WebApplication1.services;

public sealed class RecaptchaService(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<RecaptchaService> logger) : IRecaptchaService
{
    private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    public async Task<bool> VerifyAsync(string token, string expectedAction, string? remoteIp, CancellationToken cancellationToken)
    {
        var secretKey = configuration["RecaptchaSettings:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey) || string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(expectedAction))
            return false;

        var values = new Dictionary<string, string>
        {
            ["secret"] = secretKey,
            ["response"] = token
        };
        if (!string.IsNullOrWhiteSpace(remoteIp))
            values["remoteip"] = remoteIp;

        RecaptchaVerificationResponse? result;
        try
        {
            using var response = await httpClient.PostAsync(
                VerifyUrl,
                new FormUrlEncodedContent(values),
                cancellationToken);
            response.EnsureSuccessStatusCode();
            result = await response.Content.ReadFromJsonAsync<RecaptchaVerificationResponse>(
                cancellationToken: cancellationToken);
        }
        catch (HttpRequestException exception)
        {
            logger.LogError(exception, "No se pudo conectar con el servicio de verificación reCAPTCHA.");
            throw new RecaptchaUnavailableException();
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogError("La verificación reCAPTCHA excedió el tiempo de espera.");
            throw new RecaptchaUnavailableException();
        }

        if (result?.ErrorCodes?.Contains("invalid-input-secret", StringComparer.Ordinal) == true ||
            result?.ErrorCodes?.Contains("missing-input-secret", StringComparer.Ordinal) == true)
        {
            logger.LogError("Google rechazó la clave secreta configurada para reCAPTCHA.");
            throw new RecaptchaUnavailableException();
        }

        var minimumScore = configuration.GetValue("RecaptchaSettings:MinimumScore", 0.5);
        if (minimumScore is < 0 or > 1)
        {
            logger.LogError("RecaptchaSettings:MinimumScore debe estar entre 0 y 1.");
            throw new RecaptchaUnavailableException();
        }

        return result?.success == true &&
            string.Equals(result.action, expectedAction, StringComparison.Ordinal) &&
            result.score >= minimumScore;
    }

    private sealed record RecaptchaVerificationResponse(
        bool success,
        double? score,
        string? action,
        [property: JsonPropertyName("error-codes")] string[]? ErrorCodes);
}

public sealed class RecaptchaUnavailableException : Exception
{
}
