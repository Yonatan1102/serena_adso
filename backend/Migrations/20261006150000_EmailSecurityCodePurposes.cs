using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using WebApplication1;

#nullable disable

namespace WebApplication1.Migrations;

[DbContext(typeof(serena))]
[Migration("20261006150000_EmailSecurityCodePurposes")]
public sealed class EmailSecurityCodePurposes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder) =>
        migrationBuilder.AddColumn<string>(
            name: "proposito",
            table: "verificacion_correo",
            type: "nvarchar(30)",
            maxLength: 30,
            nullable: false,
            defaultValue: "verificacion-correo");

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn(name: "proposito", table: "verificacion_correo");
}