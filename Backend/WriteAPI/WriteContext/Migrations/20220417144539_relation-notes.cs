using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WriteContext.Migrations
{
    public partial class relationnotes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ReletatedNoteToInnerNote",
                schema: "note",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropColumn(
                name: "IsOpened",
                schema: "note",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                schema: "note",
                table: "ReletatedNoteToInnerNote",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReletatedNoteToInnerNote",
                schema: "note",
                table: "ReletatedNoteToInnerNote",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "RelatedNoteUserState",
                schema: "note",
                columns: table => new
                {
                    ReletatedNoteInnerNoteId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsOpened = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelatedNoteUserState", x => new { x.UserId, x.ReletatedNoteInnerNoteId });
                    table.ForeignKey(
                        name: "FK_RelatedNoteUserState_ReletatedNoteToInnerNote_ReletatedNote~",
                        column: x => x.ReletatedNoteInnerNoteId,
                        principalSchema: "note",
                        principalTable: "ReletatedNoteToInnerNote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RelatedNoteUserState_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "user",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNote_NoteId",
                schema: "note",
                table: "ReletatedNoteToInnerNote",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_RelatedNoteUserState_ReletatedNoteInnerNoteId",
                schema: "note",
                table: "RelatedNoteUserState",
                column: "ReletatedNoteInnerNoteId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RelatedNoteUserState",
                schema: "note");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ReletatedNoteToInnerNote",
                schema: "note",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropIndex(
                name: "IX_ReletatedNoteToInnerNote_NoteId",
                schema: "note",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropColumn(
                name: "Id",
                schema: "note",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpened",
                schema: "note",
                table: "ReletatedNoteToInnerNote",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReletatedNoteToInnerNote",
                schema: "note",
                table: "ReletatedNoteToInnerNote",
                columns: new[] { "NoteId", "RelatedNoteId" });
        }
    }
}
