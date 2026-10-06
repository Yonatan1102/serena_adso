using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using WebApplication1;

#nullable disable

namespace WebApplication1.Migrations;

[DbContext(typeof(serena))]
[Migration("20261005195730_IdentityProgramsAndEmailOtp")]
public partial class IdentityProgramsAndEmailOtp : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE [rol] SET [nombre_rol] = N'Psicosocial'
            WHERE LOWER([nombre_rol]) IN (N'psicólogo', N'psicosocial');
            UPDATE [rol] SET [nombre_rol] = N'Admin'
            WHERE LOWER([nombre_rol]) IN (N'administrador', N'admin');
            """);

        migrationBuilder.CreateTable(
            name: "programa",
            columns: table => new
            {
                id_programa = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                nombre_programa = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_programa", item => item.id_programa));

        migrationBuilder.CreateIndex(
            name: "IX_programa_nombre_programa",
            table: "programa",
            column: "nombre_programa",
            unique: true);

        migrationBuilder.AddColumn<int>(
            name: "id_programa",
            table: "ficha",
            type: "int",
            nullable: true);

        migrationBuilder.Sql("""
            INSERT INTO [programa] ([nombre_programa])
            SELECT DISTINCT COALESCE(NULLIF(LTRIM(RTRIM([programa])), N''), N'Programa no especificado')
            FROM [ficha];

            UPDATE [f]
            SET [f].[id_programa] = [p].[id_programa]
            FROM [ficha] AS [f]
            INNER JOIN [programa] AS [p]
                ON [p].[nombre_programa] =
                   COALESCE(NULLIF(LTRIM(RTRIM([f].[programa])), N''), N'Programa no especificado');

            IF EXISTS (SELECT 1 FROM [ficha] WHERE [id_programa] IS NULL)
                THROW 51000, 'No se pudo asociar una ficha a su programa.', 1;
            """);

        migrationBuilder.AlterColumn<int>(
            name: "id_programa",
            table: "ficha",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int",
            oldNullable: true);

        migrationBuilder.AddColumn<int>(
            name: "id_ficha",
            table: "usuario",
            type: "int",
            nullable: true);

        migrationBuilder.Sql("""
            UPDATE [u]
            SET [u].[id_ficha] = [assignment].[id_ficha]
            FROM [usuario] AS [u]
            CROSS APPLY
            (
                SELECT TOP (1) [uf].[id_ficha]
                FROM [usuario_ficha] AS [uf]
                WHERE [uf].[id_usuario] = [u].[id_usuario] AND [uf].[estado] = 1
                ORDER BY [uf].[fecha_asignacion] DESC, [uf].[id_usuario_ficha] DESC
            ) AS [assignment];
            """);

        migrationBuilder.AddColumn<bool>(
            name: "email_verificado",
            table: "usuario",
            type: "bit",
            nullable: true);

        migrationBuilder.Sql("UPDATE [usuario] SET [email_verificado] = 1;");

        migrationBuilder.AlterColumn<bool>(
            name: "email_verificado",
            table: "usuario",
            type: "bit",
            nullable: false,
            oldClrType: typeof(bool),
            oldType: "bit",
            oldNullable: true);

        migrationBuilder.Sql("""
            ALTER TABLE [usuario] ADD CONSTRAINT [DF_usuario_email_verificado]
                DEFAULT (0) FOR [email_verificado];

            ALTER TABLE [usuario_ficha] DROP CONSTRAINT [FK_usuario_ficha_ficha_id_ficha];
            DROP INDEX [IX_usuario_ficha_id_ficha] ON [usuario_ficha];

            CREATE TABLE [ficha_sin_identity]
            (
                [id_ficha] int NOT NULL,
                [codigo_ficha] nvarchar(50) NOT NULL,
                [programa] nvarchar(150) NOT NULL,
                [centro] nvarchar(50) NOT NULL,
                [jornada] nvarchar(50) NULL,
                [estado] bit NOT NULL,
                [id_programa] int NOT NULL,
                CONSTRAINT [PK_ficha_sin_identity] PRIMARY KEY ([id_ficha]),
                CONSTRAINT [FK_ficha_programa_id_programa]
                    FOREIGN KEY ([id_programa]) REFERENCES [programa] ([id_programa])
            );

            INSERT INTO [ficha_sin_identity]
                ([id_ficha], [codigo_ficha], [programa], [centro], [jornada], [estado], [id_programa])
            SELECT [id_ficha], [codigo_ficha], [programa], [centro], [jornada], [estado], [id_programa]
            FROM [ficha];

            DROP TABLE [ficha];
            EXEC sp_rename N'dbo.ficha_sin_identity', N'ficha';

            CREATE INDEX [IX_ficha_id_programa] ON [ficha] ([id_programa]);
            CREATE INDEX [IX_usuario_id_ficha] ON [usuario] ([id_ficha]);
            ALTER TABLE [usuario] ADD CONSTRAINT [FK_usuario_ficha_id_ficha]
                FOREIGN KEY ([id_ficha]) REFERENCES [ficha] ([id_ficha]) ON DELETE NO ACTION;
            ALTER TABLE [usuario_ficha] ADD CONSTRAINT [FK_usuario_ficha_ficha_id_ficha]
                FOREIGN KEY ([id_ficha]) REFERENCES [ficha] ([id_ficha]) ON DELETE CASCADE;
            """);

        migrationBuilder.CreateTable(
            name: "verificacion_correo",
            columns: table => new
            {
                id_verificacion = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                id_usuario = table.Column<int>(type: "int", nullable: false),
                codigo_hash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                expira_en = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                enviado_en = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                intentos = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_verificacion_correo", item => item.id_verificacion);
                table.ForeignKey(
                    name: "FK_verificacion_correo_usuario_id_usuario",
                    column: item => item.id_usuario,
                    principalTable: "usuario",
                    principalColumn: "id_usuario",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_verificacion_correo_id_usuario",
            table: "verificacion_correo",
            column: "id_usuario",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "verificacion_correo");
        migrationBuilder.Sql("""
            ALTER TABLE [usuario] DROP CONSTRAINT [FK_usuario_ficha_id_ficha];
            DROP INDEX [IX_usuario_id_ficha] ON [usuario];
            ALTER TABLE [usuario] DROP CONSTRAINT [DF_usuario_email_verificado];
            ALTER TABLE [usuario] DROP COLUMN [email_verificado];
            ALTER TABLE [usuario] DROP COLUMN [id_ficha];

            ALTER TABLE [usuario_ficha] DROP CONSTRAINT [FK_usuario_ficha_ficha_id_ficha];
            DROP INDEX [IX_ficha_id_programa] ON [ficha];

            CREATE TABLE [ficha_con_identity]
            (
                [id_ficha] int IDENTITY(1,1) NOT NULL,
                [codigo_ficha] nvarchar(50) NOT NULL,
                [programa] nvarchar(150) NOT NULL,
                [centro] nvarchar(50) NOT NULL,
                [jornada] nvarchar(50) NULL,
                [estado] bit NOT NULL,
                CONSTRAINT [PK_ficha_con_identity] PRIMARY KEY ([id_ficha])
            );

            SET IDENTITY_INSERT [ficha_con_identity] ON;
            INSERT INTO [ficha_con_identity] ([id_ficha], [codigo_ficha], [programa], [centro], [jornada], [estado])
            SELECT [id_ficha], [codigo_ficha], [programa], [centro], [jornada], [estado] FROM [ficha];
            SET IDENTITY_INSERT [ficha_con_identity] OFF;

            DROP TABLE [ficha];
            EXEC sp_rename N'dbo.ficha_con_identity', N'ficha';

            CREATE INDEX [IX_usuario_ficha_id_ficha] ON [usuario_ficha] ([id_ficha]);
            ALTER TABLE [usuario_ficha] ADD CONSTRAINT [FK_usuario_ficha_ficha_id_ficha]
                FOREIGN KEY ([id_ficha]) REFERENCES [ficha] ([id_ficha]) ON DELETE CASCADE;
            """);
        migrationBuilder.DropTable(name: "programa");
        migrationBuilder.Sql("""
            UPDATE [rol] SET [nombre_rol] = N'Psicólogo' WHERE [nombre_rol] = N'Psicosocial';
            UPDATE [rol] SET [nombre_rol] = N'Administrador' WHERE [nombre_rol] = N'Admin';
            """);
    }
}
