using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using WebApplication1;

#nullable disable

namespace WebApplication1.Migrations;

[DbContext(typeof(serena))]
[Migration("20261006190000_ClinicalSupportsAndNotes")]
public sealed class ClinicalSupportsAndNotes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "soporte_clinico",
            columns: table => new
            {
                id_soporte = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                id_aprendiz = table.Column<int>(type: "int", nullable: false),
                nombre_archivo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                archivo = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                fecha_carga = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_soporte_clinico", item => item.id_soporte));

        migrationBuilder.CreateTable(
            name: "anotacion_clinica",
            columns: table => new
            {
                id_anotacion = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                id_aprendiz = table.Column<int>(type: "int", nullable: false),
                id_psicosocial = table.Column<int>(type: "int", nullable: false),
                nombre_psicosocial = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                tipo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                contenido = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                fecha = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_anotacion_clinica", item => item.id_anotacion));

        migrationBuilder.CreateIndex("IX_soporte_clinico_id_aprendiz", "soporte_clinico", "id_aprendiz");
        migrationBuilder.CreateIndex("IX_anotacion_clinica_id_aprendiz", "anotacion_clinica", "id_aprendiz");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "anotacion_clinica");
        migrationBuilder.DropTable(name: "soporte_clinico");
    }
}