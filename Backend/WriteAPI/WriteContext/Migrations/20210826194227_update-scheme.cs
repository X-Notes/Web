using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class updatescheme : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "note_content");

            migrationBuilder.RenameTable(
                name: "VideosCollectionNote",
                schema: "note",
                newName: "VideosCollectionNote",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "VideoNoteAppFile",
                schema: "file",
                newName: "VideoNoteAppFile",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "TextNote",
                schema: "note",
                newName: "TextNote",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "PhotosCollectionNote",
                schema: "note",
                newName: "PhotosCollectionNote",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "PhotoNoteAppFile",
                schema: "file",
                newName: "PhotoNoteAppFile",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "DocumentsCollectionNote",
                schema: "note",
                newName: "DocumentsCollectionNote",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "DocumentNoteAppFile",
                schema: "file",
                newName: "DocumentNoteAppFile",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "ContentType",
                schema: "note",
                newName: "ContentType",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "BaseNoteContent",
                schema: "note",
                newName: "BaseNoteContent",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "AudiosCollectionNote",
                schema: "note",
                newName: "AudiosCollectionNote",
                newSchema: "note_content");

            migrationBuilder.RenameTable(
                name: "AudioNoteAppFile",
                schema: "file",
                newName: "AudioNoteAppFile",
                newSchema: "note_content");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "VideosCollectionNote",
                schema: "note_content",
                newName: "VideosCollectionNote",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "VideoNoteAppFile",
                schema: "note_content",
                newName: "VideoNoteAppFile",
                newSchema: "file");

            migrationBuilder.RenameTable(
                name: "TextNote",
                schema: "note_content",
                newName: "TextNote",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "PhotosCollectionNote",
                schema: "note_content",
                newName: "PhotosCollectionNote",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "PhotoNoteAppFile",
                schema: "note_content",
                newName: "PhotoNoteAppFile",
                newSchema: "file");

            migrationBuilder.RenameTable(
                name: "DocumentsCollectionNote",
                schema: "note_content",
                newName: "DocumentsCollectionNote",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "DocumentNoteAppFile",
                schema: "note_content",
                newName: "DocumentNoteAppFile",
                newSchema: "file");

            migrationBuilder.RenameTable(
                name: "ContentType",
                schema: "note_content",
                newName: "ContentType",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "BaseNoteContent",
                schema: "note_content",
                newName: "BaseNoteContent",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "AudiosCollectionNote",
                schema: "note_content",
                newName: "AudiosCollectionNote",
                newSchema: "note");

            migrationBuilder.RenameTable(
                name: "AudioNoteAppFile",
                schema: "note_content",
                newName: "AudioNoteAppFile",
                newSchema: "file");
        }
    }
}
