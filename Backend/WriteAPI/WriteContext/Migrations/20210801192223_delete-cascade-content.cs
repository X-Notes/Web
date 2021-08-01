using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class deletecascadecontent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_NoteSnapshots_NoteSnapshotId",
                table: "BaseNoteContents");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_NoteSnapshots_NoteSnapshotId",
                table: "BaseNoteContents",
                column: "NoteSnapshotId",
                principalTable: "NoteSnapshots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_NoteSnapshots_NoteSnapshotId",
                table: "BaseNoteContents");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_NoteSnapshots_NoteSnapshotId",
                table: "BaseNoteContents",
                column: "NoteSnapshotId",
                principalTable: "NoteSnapshots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
