using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class updatescheme2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "NoteTextType",
                schema: "note",
                newName: "NoteTextType",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "HType",
                schema: "note",
                newName: "HType",
                newSchema: "note_content");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "NoteTextType",
                schema: "note_content",
                newName: "NoteTextType",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "HType",
                schema: "note_content",
                newName: "HType",
                newSchema: "note");
        }
    }
}
