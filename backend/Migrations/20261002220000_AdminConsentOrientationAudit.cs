using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using WebApplication1;

#nullable disable

namespace WebApplication1.Migrations;

[DbContext(typeof(serena))]
[Migration("20261002220000_AdminConsentOrientationAudit")]
public partial class AdminConsentOrientationAudit : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "documento",
            table: "usuario",
            type: "nvarchar(30)",
            maxLength: 30,
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "acepta_tratamiento_datos",
            table: "usuario",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTime>(
            name: "fecha_consentimiento",
            table: "usuario",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "estado_anterior",
            table: "historial_cita",
            type: "nvarchar(max)",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "estado_nuevo",
            table: "historial_cita",
            type: "nvarchar(max)",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "motivo_cambio",
            table: "historial_cita",
            type: "nvarchar(300)",
            maxLength: 300,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "documento", table: "usuario");
        migrationBuilder.DropColumn(name: "acepta_tratamiento_datos", table: "usuario");
        migrationBuilder.DropColumn(name: "fecha_consentimiento", table: "usuario");
        migrationBuilder.DropColumn(name: "estado_anterior", table: "historial_cita");
        migrationBuilder.DropColumn(name: "estado_nuevo", table: "historial_cita");
        migrationBuilder.DropColumn(name: "motivo_cambio", table: "historial_cita");
    }
}
