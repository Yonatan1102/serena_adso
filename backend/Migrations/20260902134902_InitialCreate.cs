using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "emergencia",
                columns: table => new
                {
                    id_emergencia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    fecha_emergencia = table.Column<DateTime>(type: "datetime2", nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_emergencia", x => x.id_emergencia);
                });

            migrationBuilder.CreateTable(
                name: "menu",
                columns: table => new
                {
                    id_menu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_menu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_menu", x => x.id_menu);
                });

            migrationBuilder.CreateTable(
                name: "publicaciones",
                columns: table => new
                {
                    id_publicacion = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    titulo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    contenido = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fecha_publicacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_publicaciones", x => x.id_publicacion);
                });

            migrationBuilder.CreateTable(
                name: "rol",
                columns: table => new
                {
                    id_rol = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_rol = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rol", x => x.id_rol);
                });

            migrationBuilder.CreateTable(
                name: "menu_rol",
                columns: table => new
                {
                    id_menu_rol = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_rol = table.Column<int>(type: "int", nullable: false),
                    id_menu = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_menu_rol", x => x.id_menu_rol);
                    table.ForeignKey(
                        name: "FK_menu_rol_menu_id_menu",
                        column: x => x.id_menu,
                        principalTable: "menu",
                        principalColumn: "id_menu",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_menu_rol_rol_id_rol",
                        column: x => x.id_rol,
                        principalTable: "rol",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "usuario",
                columns: table => new
                {
                    id_usuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_usuario = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    contrasena = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    id_rol = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuario", x => x.id_usuario);
                    table.ForeignKey(
                        name: "FK_usuario_rol_id_rol",
                        column: x => x.id_rol,
                        principalTable: "rol",
                        principalColumn: "id_rol",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "cita",
                columns: table => new
                {
                    id_cita = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fecha_hora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    motivo = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    estado_cita = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    id_usuario_aprendiz = table.Column<int>(type: "int", nullable: false),
                    id_usuario_psicologo = table.Column<int>(type: "int", nullable: false),
                    id_usuario_aprendiz_navegacionid_usuario = table.Column<int>(type: "int", nullable: true),
                    id_usuario_psicologo_navegacionid_usuario = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cita", x => x.id_cita);
                    table.ForeignKey(
                        name: "FK_cita_usuario_id_usuario_aprendiz",
                        column: x => x.id_usuario_aprendiz,
                        principalTable: "usuario",
                        principalColumn: "id_usuario");
                    table.ForeignKey(
                        name: "FK_cita_usuario_id_usuario_aprendiz_navegacionid_usuario",
                        column: x => x.id_usuario_aprendiz_navegacionid_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario");
                    table.ForeignKey(
                        name: "FK_cita_usuario_id_usuario_psicologo",
                        column: x => x.id_usuario_psicologo,
                        principalTable: "usuario",
                        principalColumn: "id_usuario");
                    table.ForeignKey(
                        name: "FK_cita_usuario_id_usuario_psicologo_navegacionid_usuario",
                        column: x => x.id_usuario_psicologo_navegacionid_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario");
                });

            migrationBuilder.CreateTable(
                name: "diario",
                columns: table => new
                {
                    id_diario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    fecha_diario = table.Column<DateTime>(type: "datetime2", nullable: false),
                    compartir = table.Column<bool>(type: "bit", nullable: false),
                    contenido = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_diario", x => x.id_diario);
                    table.ForeignKey(
                        name: "FK_diario_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "estado_de_animo",
                columns: table => new
                {
                    id_estado = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_estado = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    fecha_estado = table.Column<DateTime>(type: "datetime2", nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_estado_de_animo", x => x.id_estado);
                    table.ForeignKey(
                        name: "FK_estado_de_animo_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "formulario",
                columns: table => new
                {
                    id_formulario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre_formulario = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    usuarioid_usuario = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formulario", x => x.id_formulario);
                    table.ForeignKey(
                        name: "FK_formulario_usuario_usuarioid_usuario",
                        column: x => x.usuarioid_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario");
                });

            migrationBuilder.CreateTable(
                name: "historial_clinico",
                columns: table => new
                {
                    id_h_clinico = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_usuario = table.Column<int>(type: "int", nullable: false),
                    num_ficha = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fecha_apertura = table.Column<DateTime>(type: "datetime2", nullable: false),
                    condiciones = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    antecedentes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_historial_clinico", x => x.id_h_clinico);
                    table.ForeignKey(
                        name: "FK_historial_clinico_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "historial_cita",
                columns: table => new
                {
                    id_h_cita = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_cita = table.Column<int>(type: "int", nullable: false),
                    observacion_historial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fecha_cambio = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_historial_cita", x => x.id_h_cita);
                    table.ForeignKey(
                        name: "FK_historial_cita_cita_id_cita",
                        column: x => x.id_cita,
                        principalTable: "cita",
                        principalColumn: "id_cita",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cita_id_usuario_aprendiz",
                table: "cita",
                column: "id_usuario_aprendiz");

            migrationBuilder.CreateIndex(
                name: "IX_cita_id_usuario_aprendiz_navegacionid_usuario",
                table: "cita",
                column: "id_usuario_aprendiz_navegacionid_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_cita_id_usuario_psicologo",
                table: "cita",
                column: "id_usuario_psicologo");

            migrationBuilder.CreateIndex(
                name: "IX_cita_id_usuario_psicologo_navegacionid_usuario",
                table: "cita",
                column: "id_usuario_psicologo_navegacionid_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_diario_id_usuario",
                table: "diario",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_estado_de_animo_id_usuario",
                table: "estado_de_animo",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_formulario_usuarioid_usuario",
                table: "formulario",
                column: "usuarioid_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_historial_cita_id_cita",
                table: "historial_cita",
                column: "id_cita");

            migrationBuilder.CreateIndex(
                name: "IX_historial_clinico_id_usuario",
                table: "historial_clinico",
                column: "id_usuario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_menu_rol_id_menu",
                table: "menu_rol",
                column: "id_menu");

            migrationBuilder.CreateIndex(
                name: "IX_menu_rol_id_rol",
                table: "menu_rol",
                column: "id_rol");

            migrationBuilder.CreateIndex(
                name: "IX_usuario_id_rol",
                table: "usuario",
                column: "id_rol");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "diario");

            migrationBuilder.DropTable(
                name: "emergencia");

            migrationBuilder.DropTable(
                name: "estado_de_animo");

            migrationBuilder.DropTable(
                name: "formulario");

            migrationBuilder.DropTable(
                name: "historial_cita");

            migrationBuilder.DropTable(
                name: "historial_clinico");

            migrationBuilder.DropTable(
                name: "menu_rol");

            migrationBuilder.DropTable(
                name: "publicaciones");

            migrationBuilder.DropTable(
                name: "cita");

            migrationBuilder.DropTable(
                name: "menu");

            migrationBuilder.DropTable(
                name: "usuario");

            migrationBuilder.DropTable(
                name: "rol");
        }
    }
}
