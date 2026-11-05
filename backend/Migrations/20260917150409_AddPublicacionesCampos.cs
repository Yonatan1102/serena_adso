using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicacionesCampos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "comentarios_count",
                table: "Publicaciones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "etiqueta",
                table: "Publicaciones",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "id_comunidad",
                table: "Publicaciones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "imagen_url",
                table: "Publicaciones",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "votos",
                table: "Publicaciones",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "comentarios_count",
                table: "Publicaciones");

            migrationBuilder.DropColumn(
                name: "etiqueta",
                table: "Publicaciones");

            migrationBuilder.DropColumn(
                name: "id_comunidad",
                table: "Publicaciones");

            migrationBuilder.DropColumn(
                name: "imagen_url",
                table: "Publicaciones");

            migrationBuilder.DropColumn(
                name: "votos",
                table: "Publicaciones");
        }
    }
}
