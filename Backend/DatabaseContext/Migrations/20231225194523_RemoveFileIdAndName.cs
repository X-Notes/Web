using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseContext.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFileIdAndName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContent_FileType_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropIndex(
                name: "IX_BaseNoteContent_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "Name",
                schema: "note_content",
                table: "BaseNoteContent");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContent_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                column: "FileTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContent_FileType_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                column: "FileTypeId",
                principalSchema: "file",
                principalTable: "FileType",
                principalColumn: "Id");
        }
    }
}
