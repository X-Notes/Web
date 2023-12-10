using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseContext.Migrations
{
    public partial class RemoveTPH : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CollectionNoteAppFile_BaseNoteContent_CollectionNoteId",
                schema: "note_content",
                table: "CollectionNoteAppFile");

            migrationBuilder.DropForeignKey(
                name: "FK_TextNoteIndex_BaseNoteContent_TextNoteId",
                schema: "note_content",
                table: "TextNoteIndex");

            migrationBuilder.DropColumn(
                name: "TextNote_Metadata",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.RenameColumn(
                name: "TextNoteId",
                schema: "note_content",
                table: "TextNoteIndex",
                newName: "BaseNoteContentId");

            migrationBuilder.RenameColumn(
                name: "CollectionNoteId",
                schema: "note_content",
                table: "CollectionNoteAppFile",
                newName: "BaseNoteContentId");

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
                name: "FK_CollectionNoteAppFile_BaseNoteContent_BaseNoteContentId",
                schema: "note_content",
                table: "CollectionNoteAppFile",
                column: "BaseNoteContentId",
                principalSchema: "note_content",
                principalTable: "BaseNoteContent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TextNoteIndex_BaseNoteContent_BaseNoteContentId",
                schema: "note_content",
                table: "TextNoteIndex",
                column: "BaseNoteContentId",
                principalSchema: "note_content",
                principalTable: "BaseNoteContent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CollectionNoteAppFile_BaseNoteContent_BaseNoteContentId",
                schema: "note_content",
                table: "CollectionNoteAppFile");

            migrationBuilder.DropForeignKey(
                name: "FK_TextNoteIndex_BaseNoteContent_BaseNoteContentId",
                schema: "note_content",
                table: "TextNoteIndex");

            migrationBuilder.RenameColumn(
                name: "BaseNoteContentId",
                schema: "note_content",
                table: "TextNoteIndex",
                newName: "TextNoteId");

            migrationBuilder.RenameColumn(
                name: "BaseNoteContentId",
                schema: "note_content",
                table: "CollectionNoteAppFile",
                newName: "CollectionNoteId");

            migrationBuilder.AlterColumn<int>(
                name: "FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "TextNote_Metadata",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CollectionNoteAppFile_BaseNoteContent_CollectionNoteId",
                schema: "note_content",
                table: "CollectionNoteAppFile",
                column: "CollectionNoteId",
                principalSchema: "note_content",
                principalTable: "BaseNoteContent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TextNoteIndex_BaseNoteContent_TextNoteId",
                schema: "note_content",
                table: "TextNoteIndex",
                column: "TextNoteId",
                principalSchema: "note_content",
                principalTable: "BaseNoteContent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
