using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class EstadoAnimoIntermedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_estado_de_animo_usuario_id_usuario",
                table: "estado_de_animo");

            migrationBuilder.DropIndex(
                name: "IX_estado_de_animo_id_usuario",
                table: "estado_de_animo");

            migrationBuilder.DropColumn(
                name: "fecha_estado",
                table: "estado_de_animo");

            migrationBuilder.DropColumn(
                name: "id_usuario",
                table: "estado_de_animo");

            migrationBuilder.CreateTable(
                name: "estado_animo_usuario",
                columns: table => new
                {
                    id_estado_usuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_estado = table.Column<int>(type: "int", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    fecha_estado = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_estado_animo_usuario", x => x.id_estado_usuario);
                    table.ForeignKey(
                        name: "FK_estado_animo_usuario_estado_de_animo_id_estado",
                        column: x => x.id_estado,
                        principalTable: "estado_de_animo",
                        principalColumn: "id_estado",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_estado_animo_usuario_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_estado_animo_usuario_id_estado",
                table: "estado_animo_usuario",
                column: "id_estado");

            migrationBuilder.CreateIndex(
                name: "IX_estado_animo_usuario_id_usuario",
                table: "estado_animo_usuario",
                column: "id_usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "estado_animo_usuario");

            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_estado",
                table: "estado_de_animo",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "id_usuario",
                table: "estado_de_animo",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_estado_de_animo_id_usuario",
                table: "estado_de_animo",
                column: "id_usuario");

            migrationBuilder.AddForeignKey(
                name: "FK_estado_de_animo_usuario_id_usuario",
                table: "estado_de_animo",
                column: "id_usuario",
                principalTable: "usuario",
                principalColumn: "id_usuario",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
