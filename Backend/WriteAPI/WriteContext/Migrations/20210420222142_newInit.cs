using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class newInit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlbumNoteAppFile");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlbumNoteAppFile",
                columns: table => new
                {
                    AlbumNotesId = table.Column<Guid>(type: "uuid", nullable: false),
                    PhotosId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlbumNoteAppFile", x => new { x.AlbumNotesId, x.PhotosId });
                    table.ForeignKey(
                        name: "FK_AlbumNoteAppFile_AlbumNote_AlbumNotesId",
                        column: x => x.AlbumNotesId,
                        principalTable: "AlbumNote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlbumNoteAppFile_Files_PhotosId",
                        column: x => x.PhotosId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlbumNoteAppFile_PhotosId",
                table: "AlbumNoteAppFile",
                column: "PhotosId");
        }
    }
}
