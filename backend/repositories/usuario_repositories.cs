using Microsoft.EntityFrameworkCore;
using WebApplication1.interfaces;
using WebApplication1.models;

namespace WebApplication1.repositories;

public class UsuarioRepository : IUsuario, ILoginService
{
    private readonly SerenaDbContext context;
    private readonly IPasswordService passwordService;

    public UsuarioRepository(SerenaDbContext context, IPasswordService passwordService)
    {
        this.context = context;
        this.passwordService = passwordService;
    }

    public Task<List<Usuario>> Getusuario() => context.Usuario.AsNoTracking().ToListAsync();

    public Task<Usuario?> GetusuarioById(int id) =>
        context.Usuario.AsNoTracking().FirstOrDefaultAsync(x => x.id_usuario == id);

    public async Task<Usuario> Postusuario(Usuario Usuario)
    {
        Usuario.contrasena = passwordService.HashPassword(Usuario.contrasena);
        context.Usuario.Add(Usuario);
        await context.SaveChangesAsync();
        return Usuario;
    }

    public async Task<Usuario?> Putusuario(Usuario Usuario)
    {
        var existente = await context.Usuario.FirstOrDefaultAsync(x => x.id_usuario == Usuario.id_usuario);
        if (existente == null) return null;
        existente.nombre_usuario = Usuario.nombre_usuario;
        existente.email = Usuario.email;
        existente.id_rol = Usuario.id_rol;
        if (!string.IsNullOrWhiteSpace(Usuario.contrasena))
            existente.contrasena = passwordService.HashPassword(Usuario.contrasena);
        await context.SaveChangesAsync();
        return existente;
    }

    public async Task<bool> Deleteusuario(int id)
    {
        var existente = await context.Usuario.FirstOrDefaultAsync(x => x.id_usuario == id);
        if (existente == null) return false;
        context.Usuario.Remove(existente);
        await context.SaveChangesAsync();
        return true;
    }

    public Task<Usuario?> BuscarPorCorreo(string email) =>
        context.Usuario.AsNoTracking().FirstOrDefaultAsync(x => x.email == email);

    public async Task<Usuario?> ValidarCredenciales(string email, string contrasena)
    {
        var Usuario = await context.Usuario.FirstOrDefaultAsync(x => x.email == email);
        if (Usuario == null) return null;
        var resultado = passwordService.VerifyPassword(contrasena, Usuario.contrasena);
        return resultado ? Usuario : null;
    }

    public Task<Usuario> Registrar(Usuario Usuario) => Postusuario(Usuario);

    public async Task<bool> CambiarContrasena(string email, string contrasenaActual, string nuevaContrasena)
    {
        var Usuario = await context.Usuario.FirstOrDefaultAsync(x => x.email == email);
        if (Usuario == null) return false;

        var resultado = passwordService.VerifyPassword(contrasenaActual, Usuario.contrasena);
        if (!resultado) return false;

        Usuario.contrasena = passwordService.HashPassword(nuevaContrasena);
        await context.SaveChangesAsync();
        return true;
    }
}
