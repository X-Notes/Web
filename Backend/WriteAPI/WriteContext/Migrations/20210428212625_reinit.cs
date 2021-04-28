using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class reinit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NoteHistory_Notes_NoteId",
                table: "NoteHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteHistory_NoteHistoryId",
                table: "UserNoteHistoryManyToMany");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NoteHistory",
                table: "NoteHistory");

            migrationBuilder.RenameTable(
                name: "NoteHistory",
                newName: "NoteHistories");

            migrationBuilder.RenameIndex(
                name: "IX_NoteHistory_NoteId",
                table: "NoteHistories",
                newName: "IX_NoteHistories_NoteId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NoteHistories",
                table: "NoteHistories",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_NoteHistories_Notes_NoteId",
                table: "NoteHistories",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteHistories_NoteHistoryId",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId",
                principalTable: "NoteHistories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NoteHistories_Notes_NoteId",
                table: "NoteHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteHistories_NoteHistoryId",
                table: "UserNoteHistoryManyToMany");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NoteHistories",
                table: "NoteHistories");

            migrationBuilder.RenameTable(
                name: "NoteHistories",
                newName: "NoteHistory");

            migrationBuilder.RenameIndex(
                name: "IX_NoteHistories_NoteId",
                table: "NoteHistory",
                newName: "IX_NoteHistory_NoteId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NoteHistory",
                table: "NoteHistory",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_NoteHistory_Notes_NoteId",
                table: "NoteHistory",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteHistory_NoteHistoryId",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId",
                principalTable: "NoteHistory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
