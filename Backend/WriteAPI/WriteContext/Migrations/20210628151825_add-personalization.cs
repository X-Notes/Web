using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class addpersonalization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PersonalizationSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NotesInFolderCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    isViewVideoOnNote = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    isViewAudioOnNote = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    isViewPhotosOnNote = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    isViewTextOnNote = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    isViewDocumentOnNote = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalizationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalizationSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizationSettings_UserId",
                table: "PersonalizationSettings",
                column: "UserId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PersonalizationSettings");
        }
    }
}
