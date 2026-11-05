using WebApplication1.services;
using Xunit;

namespace SerenaApi.Tests;

public class PasswordServiceTests
{
    [Fact]
    public void HashPassword_ProducesDifferentValueThanPlainText()
    {
        var service = new PasswordService();

        var hash = service.HashPassword("P@ssw0rd123");

        Assert.NotEqual("P@ssw0rd123", hash);
        Assert.False(string.IsNullOrWhiteSpace(hash));
    }

    [Fact]
    public void VerifyPassword_ReturnsTrue_WhenPasswordMatchesHash()
    {
        var service = new PasswordService();
        var password = "P@ssw0rd123";

        var hash = service.HashPassword(password);

        Assert.True(service.VerifyPassword(password, hash));
    }

    [Fact]
    public void VerifyPassword_ReturnsFalse_WhenPasswordDoesNotMatchHash()
    {
        var service = new PasswordService();
        var hash = service.HashPassword("P@ssw0rd123");

        Assert.False(service.VerifyPassword("WrongPassword!", hash));
    }
}
