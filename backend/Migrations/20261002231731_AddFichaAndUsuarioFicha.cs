using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddFichaAndUsuarioFicha : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "disponibilidad",
                columns: table => new
                {
                    id_disponibilidad = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    id_rol = table.Column<int>(type: "int", nullable: false),
                    dia_semana = table.Column<byte>(type: "tinyint", nullable: false),
                    hora_inicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    hora_fin = table.Column<TimeSpan>(type: "time", nullable: false),
                    estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_disponibilidad", x => x.id_disponibilidad);
                    table.ForeignKey(
                        name: "FK_disponibilidad_rol_id_rol",
                        column: x => x.id_rol,
                        principalTable: "rol",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_disponibilidad_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ficha",
                columns: table => new
                {
                    id_ficha = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    codigo_ficha = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    programa = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    centro = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    jornada = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ficha", x => x.id_ficha);
                });

            migrationBuilder.CreateTable(
                name: "usuario_ficha",
                columns: table => new
                {
                    id_usuario_ficha = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    id_ficha = table.Column<int>(type: "int", nullable: false),
                    fecha_asignacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuario_ficha", x => x.id_usuario_ficha);
                    table.ForeignKey(
                        name: "FK_usuario_ficha_ficha_id_ficha",
                        column: x => x.id_ficha,
                        principalTable: "ficha",
                        principalColumn: "id_ficha",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_usuario_ficha_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_disponibilidad_id_rol",
                table: "disponibilidad",
                column: "id_rol");

            migrationBuilder.CreateIndex(
                name: "IX_disponibilidad_id_usuario",
                table: "disponibilidad",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_usuario_ficha_id_ficha",
                table: "usuario_ficha",
                column: "id_ficha");

            migrationBuilder.CreateIndex(
                name: "IX_usuario_ficha_id_usuario",
                table: "usuario_ficha",
                column: "id_usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "disponibilidad");

            migrationBuilder.DropTable(
                name: "usuario_ficha");

            migrationBuilder.DropTable(
                name: "ficha");
        }
    }
}
