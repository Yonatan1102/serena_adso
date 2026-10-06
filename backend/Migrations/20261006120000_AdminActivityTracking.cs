using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using WebApplication1;

#nullable disable

namespace WebApplication1.Migrations;

[DbContext(typeof(serena))]
[Migration("20261006120000_AdminActivityTracking")]
public sealed class AdminActivityTracking : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder) =>
        migrationBuilder.AddColumn<DateTime>(
            name: "ultimo_acceso",
            table: "usuario",
            type: "datetime2",
            nullable: true);

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn(name: "ultimo_acceso", table: "usuario");
}