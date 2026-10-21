using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using WebApplication1;

#nullable disable

namespace WebApplication1.Migrations;

[DbContext(typeof(serena))]
[Migration("20261006170000_AvailabilitySpecificDates")]
public sealed class AvailabilitySpecificDates : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateOnly>(
            name: "fecha",
            table: "disponibilidad",
            type: "date",
            nullable: true);

        migrationBuilder.Sql("""
            DECLARE @hoy date = CONVERT(date, GETDATE());
            DECLARE @diaHoy int = (DATEDIFF(day, CONVERT(date, '19000101'), @hoy) % 7) + 1;
            UPDATE [disponibilidad]
            SET [fecha] = DATEADD(day,
                CASE WHEN ([dia_semana] - @diaHoy + 7) % 7 = 0
                     THEN 7 ELSE ([dia_semana] - @diaHoy + 7) % 7 END,
                @hoy);
            """);

        migrationBuilder.AlterColumn<DateOnly>(
            name: "fecha",
            table: "disponibilidad",
            type: "date",
            nullable: false,
            oldClrType: typeof(DateOnly),
            oldType: "date",
            oldNullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn(name: "fecha", table: "disponibilidad");
}