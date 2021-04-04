using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class Relation2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
