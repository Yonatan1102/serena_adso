using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class usuario_repositories : Iusuario, Iloginservice
{
    private readonly serena context;

    public usuario_repositories(serena context) => this.context = context;

    public Task<List<usuario>> Getusuario() => context.usuario.AsNoTracking().ToListAsync();

    public Task<usuario?> GetusuarioById(int id) =>
        context.usuario.AsNoTracking().FirstOrDefaultAsync(x => x.id_usuario == id);

    public async Task<usuario> Postusuario(usuario usuario)
    {
        usuario.contrasena = new PasswordHasher<usuario>().HashPassword(usuario, usuario.contrasena);
        context.usuario.Add(usuario);
        await context.SaveChangesAsync();
        return usuario;
    }

    public async Task<usuario?> Putusuario(usuario usuario)
    {
        var existente = await context.usuario.FirstOrDefaultAsync(x => x.id_usuario == usuario.id_usuario);
        if (existente == null) return null;
        existente.nombre_usuario = usuario.nombre_usuario;
        existente.email = usuario.email;
        existente.id_rol = usuario.id_rol;
        if (!string.IsNullOrWhiteSpace(usuario.contrasena))
            existente.contrasena = new PasswordHasher<usuario>().HashPassword(existente, usuario.contrasena);
        await context.SaveChangesAsync();
        return existente;
    }

    public async Task<bool> Deleteusuario(int id)
    {
        var existente = await context.usuario.FirstOrDefaultAsync(x => x.id_usuario == id);
        if (existente == null) return false;
        context.usuario.Remove(existente);
        await context.SaveChangesAsync();
        return true;
    }

    public Task<usuario?> BuscarPorCorreo(string email) =>
        context.usuario.AsNoTracking().FirstOrDefaultAsync(x => x.email == email);

    public async Task<usuario?> ValidarCredenciales(string email, string contrasena)
    {
        var usuario = await context.usuario.FirstOrDefaultAsync(x => x.email == email);
        if (usuario == null) return null;
        var resultado = new PasswordHasher<usuario>().VerifyHashedPassword(usuario, usuario.contrasena, contrasena);
        return resultado == PasswordVerificationResult.Success ? usuario : null;
    }

    public Task<usuario> Registrar(usuario usuario) => Postusuario(usuario);
}
