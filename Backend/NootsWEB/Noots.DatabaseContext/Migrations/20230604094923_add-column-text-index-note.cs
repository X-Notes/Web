using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class addcolumntextindexnote : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "NoteId",
                schema: "note_content",
                table: "TextNoteIndex",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TextNoteIndex_NoteId",
                schema: "note_content",
                table: "TextNoteIndex",
                column: "NoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_TextNoteIndex_Note_NoteId",
                schema: "note_content",
                table: "TextNoteIndex",
                column: "NoteId",
                principalSchema: "note",
                principalTable: "Note",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TextNoteIndex_Note_NoteId",
                schema: "note_content",
                table: "TextNoteIndex");

            migrationBuilder.DropIndex(
                name: "IX_TextNoteIndex_NoteId",
                schema: "note_content",
                table: "TextNoteIndex");

            migrationBuilder.DropColumn(
                name: "NoteId",
                schema: "note_content",
                table: "TextNoteIndex");
        }
    }
}
