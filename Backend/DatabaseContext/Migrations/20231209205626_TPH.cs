using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseContext.Migrations
{
    public partial class TPH : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CollectionNoteAppFile_CollectionNote_CollectionNoteId",
                schema: "note_content",
                table: "CollectionNoteAppFile");

            migrationBuilder.DropForeignKey(
                name: "FK_TextNoteIndex_TextNote_TextNoteId",
                schema: "note_content",
                table: "TextNoteIndex");

            migrationBuilder.DropTable(
                name: "CollectionNote",
                schema: "note_content");

            migrationBuilder.DropTable(
                name: "TextNote",
                schema: "note_content");

            migrationBuilder.AddColumn<string>(
                name: "Contents",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PlainContent",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextNote_Metadata",
                schema: "note_content",
                table: "BaseNoteContent",
                type: "jsonb",
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
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContent_FileType_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropForeignKey(
                name: "FK_CollectionNoteAppFile_BaseNoteContent_CollectionNoteId",
                schema: "note_content",
                table: "CollectionNoteAppFile");

            migrationBuilder.DropForeignKey(
                name: "FK_TextNoteIndex_BaseNoteContent_TextNoteId",
                schema: "note_content",
                table: "TextNoteIndex");

            migrationBuilder.DropIndex(
                name: "IX_BaseNoteContent_FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "Contents",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "FileTypeId",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "Metadata",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "Name",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "PlainContent",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.DropColumn(
                name: "TextNote_Metadata",
                schema: "note_content",
                table: "BaseNoteContent");

            migrationBuilder.CreateTable(
                name: "CollectionNote",
                schema: "note_content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileTypeId = table.Column<int>(type: "integer", nullable: false),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollectionNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CollectionNote_BaseNoteContent_Id",
                        column: x => x.Id,
                        principalSchema: "note_content",
                        principalTable: "BaseNoteContent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CollectionNote_FileType_FileTypeId",
                        column: x => x.FileTypeId,
                        principalSchema: "file",
                        principalTable: "FileType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TextNote",
                schema: "note_content",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Contents = table.Column<string>(type: "jsonb", nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    PlainContent = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TextNote_BaseNoteContent_Id",
                        column: x => x.Id,
                        principalSchema: "note_content",
                        principalTable: "BaseNoteContent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CollectionNote_FileTypeId",
                schema: "note_content",
                table: "CollectionNote",
                column: "FileTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_CollectionNoteAppFile_CollectionNote_CollectionNoteId",
                schema: "note_content",
                table: "CollectionNoteAppFile",
                column: "CollectionNoteId",
                principalSchema: "note_content",
                principalTable: "CollectionNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TextNoteIndex_TextNote_TextNoteId",
                schema: "note_content",
                table: "TextNoteIndex",
                column: "TextNoteId",
                principalSchema: "note_content",
                principalTable: "TextNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
