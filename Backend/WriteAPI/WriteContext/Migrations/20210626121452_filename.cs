using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class filename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AudioNote_Files_AppFileId",
                table: "AudioNote");

            migrationBuilder.DropIndex(
                name: "IX_AudioNote_AppFileId",
                table: "AudioNote");

            migrationBuilder.DropColumn(
                name: "AppFileId",
                table: "AudioNote");

            migrationBuilder.AddColumn<bool>(
                name: "IsBold",
                table: "TextNote",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsItalic",
                table: "TextNote",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Files",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AudioNoteAppFile",
                columns: table => new
                {
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false),
                    AudioNoteId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioNoteAppFile", x => new { x.AudioNoteId, x.AppFileId });
                    table.ForeignKey(
                        name: "FK_AudioNoteAppFile_AudioNote_AudioNoteId",
                        column: x => x.AudioNoteId,
                        principalTable: "AudioNote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AudioNoteAppFile_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "ContentTypes",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "PlaylistAudios");

            migrationBuilder.CreateIndex(
                name: "IX_AudioNoteAppFile_AppFileId",
                table: "AudioNoteAppFile",
                column: "AppFileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AudioNoteAppFile");

            migrationBuilder.DropColumn(
                name: "IsBold",
                table: "TextNote");

            migrationBuilder.DropColumn(
                name: "IsItalic",
                table: "TextNote");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Files");

            migrationBuilder.AddColumn<Guid>(
                name: "AppFileId",
                table: "AudioNote",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                table: "ContentTypes",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "Audio");

            migrationBuilder.CreateIndex(
                name: "IX_AudioNote_AppFileId",
                table: "AudioNote",
                column: "AppFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_AudioNote_Files_AppFileId",
                table: "AudioNote",
                column: "AppFileId",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
