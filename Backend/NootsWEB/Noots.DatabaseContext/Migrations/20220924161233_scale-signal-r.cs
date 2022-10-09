using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class scalesignalr : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UnauthorizedId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FolderConnection",
                schema: "ws",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserIdentifierConnectionIdId = table.Column<Guid>(type: "uuid", nullable: false),
                    FolderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConnectionId = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FolderConnection", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FolderConnection_Folder_FolderId",
                        column: x => x.FolderId,
                        principalSchema: "folder",
                        principalTable: "Folder",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FolderConnection_UserIdentifierConnectionId_UserIdentifierC~",
                        column: x => x.UserIdentifierConnectionIdId,
                        principalSchema: "ws",
                        principalTable: "UserIdentifierConnectionId",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NoteConnection",
                schema: "ws",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserIdentifierConnectionIdId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConnectionId = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteConnection", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoteConnection_Note_NoteId",
                        column: x => x.NoteId,
                        principalSchema: "note",
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoteConnection_UserIdentifierConnectionId_UserIdentifierCon~",
                        column: x => x.UserIdentifierConnectionIdId,
                        principalSchema: "ws",
                        principalTable: "UserIdentifierConnectionId",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FolderConnection_FolderId",
                schema: "ws",
                table: "FolderConnection",
                column: "FolderId");

            migrationBuilder.CreateIndex(
                name: "IX_FolderConnection_UserIdentifierConnectionIdId",
                schema: "ws",
                table: "FolderConnection",
                column: "UserIdentifierConnectionIdId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteConnection_NoteId",
                schema: "ws",
                table: "NoteConnection",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteConnection_UserIdentifierConnectionIdId",
                schema: "ws",
                table: "NoteConnection",
                column: "UserIdentifierConnectionIdId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FolderConnection",
                schema: "ws");

            migrationBuilder.DropTable(
                name: "NoteConnection",
                schema: "ws");

            migrationBuilder.DropColumn(
                name: "UnauthorizedId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.AlterColumn<string>(
                name: "ConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
