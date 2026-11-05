using Microsoft.AspNetCore.Identity;
using WebApplication1.interfaces;

namespace WebApplication1.services;

public sealed class PasswordService : IPasswordService
{
    private readonly PasswordHasher<object> _passwordHasher = new();

    public string HashPassword(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        return _passwordHasher.HashPassword(new object(), password);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hashedPassword))
        {
            return false;
        }

        var verification = _passwordHasher.VerifyHashedPassword(new object(), hashedPassword, password);
        return verification == PasswordVerificationResult.Success;
    }
}
