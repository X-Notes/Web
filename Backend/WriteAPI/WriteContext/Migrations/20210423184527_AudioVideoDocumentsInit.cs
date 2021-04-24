using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class AudioVideoDocumentsInit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "BaseNoteContents",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AudioNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AudioNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AudioNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VideoNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AudioNote_AppFileId",
                table: "AudioNote",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentNote_AppFileId",
                table: "DocumentNote",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoNote_AppFileId",
                table: "VideoNote",
                column: "AppFileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AudioNote");

            migrationBuilder.DropTable(
                name: "DocumentNote");

            migrationBuilder.DropTable(
                name: "VideoNote");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "BaseNoteContents");
        }
    }
}
