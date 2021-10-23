using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class updatenaming : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserNoteHistoryManyToMany",
                schema: "note_history");

            migrationBuilder.CreateTable(
                name: "UserNoteSnapshotManyToMany",
                schema: "note_history",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteSnapshotId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNoteSnapshotManyToMany", x => new { x.UserId, x.NoteSnapshotId });
                    table.ForeignKey(
                        name: "FK_UserNoteSnapshotManyToMany_NoteSnapshot_NoteSnapshotId",
                        column: x => x.NoteSnapshotId,
                        principalSchema: "note_history",
                        principalTable: "NoteSnapshot",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserNoteSnapshotManyToMany_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "user",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserNoteSnapshotManyToMany_NoteSnapshotId",
                schema: "note_history",
                table: "UserNoteSnapshotManyToMany",
                column: "NoteSnapshotId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserNoteSnapshotManyToMany",
                schema: "note_history");

            migrationBuilder.CreateTable(
                name: "UserNoteHistoryManyToMany",
                schema: "note_history",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteHistoryId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNoteHistoryManyToMany", x => new { x.UserId, x.NoteHistoryId });
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_NoteSnapshot_NoteHistoryId",
                        column: x => x.NoteHistoryId,
                        principalSchema: "note_history",
                        principalTable: "NoteSnapshot",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "user",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserNoteHistoryManyToMany_NoteHistoryId",
                schema: "note_history",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId");
        }
    }
}
