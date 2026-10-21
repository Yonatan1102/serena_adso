using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using WebApplication1;

#nullable disable

namespace WebApplication1.Migrations;

[DbContext(typeof(serena))]
[Migration("20261006171000_RemoveWeeklyAvailabilityDay")]
public sealed class RemoveWeeklyAvailabilityDay : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn(name: "dia_semana", table: "disponibilidad");

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<byte>(
            name: "dia_semana",
            table: "disponibilidad",
            type: "tinyint",
            nullable: true);

        migrationBuilder.Sql("""
            UPDATE [disponibilidad]
            SET [dia_semana] = (DATEDIFF(day, CONVERT(date, '19000101'), [fecha]) % 7) + 1;
            """);

        migrationBuilder.AlterColumn<byte>(
            name: "dia_semana",
            table: "disponibilidad",
            type: "tinyint",
            nullable: false,
            oldClrType: typeof(byte),
            oldType: "tinyint",
            oldNullable: true);
    }
}