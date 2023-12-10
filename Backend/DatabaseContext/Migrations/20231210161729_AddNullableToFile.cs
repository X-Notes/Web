using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseContext.Migrations
{
    public partial class AddNullableToFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContent_FileType_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.AlterColumn<int>(
                name: "FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContent_FileType_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                column: "FileTypeId",
                principalSchema: "file",
                principalTable: "FileType",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContent_FileType_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.AlterColumn<int>(
                name: "FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContent_FileType_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                column: "FileTypeId",
                principalSchema: "file",
                principalTable: "FileType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
