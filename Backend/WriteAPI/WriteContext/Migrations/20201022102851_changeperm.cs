using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class changeperm : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserOnNote");

            migrationBuilder.CreateTable(
                name: "UserOnNoteNow",
                columns: table => new
                {
                    UserId = table.Column<int>(nullable: false),
                    NoteId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOnNoteNow", x => new { x.UserId, x.NoteId });
                    table.ForeignKey(
                        name: "FK_UserOnNoteNow_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnNoteNow_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserOnNoteNow_NoteId",
                table: "UserOnNoteNow",
                column: "NoteId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserOnNoteNow");

            migrationBuilder.CreateTable(
                name: "UserOnNote",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOnNote", x => new { x.UserId, x.NoteId });
                    table.ForeignKey(
                        name: "FK_UserOnNote_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnNote_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserOnNote_NoteId",
                table: "UserOnNote",
                column: "NoteId");
        }
    }
}
