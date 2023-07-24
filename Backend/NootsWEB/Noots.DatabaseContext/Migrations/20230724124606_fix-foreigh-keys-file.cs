using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class fixforeighkeysfile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserProfilePhoto_AppFileId",
                schema: "user",
                table: "UserProfilePhoto");

            migrationBuilder.DropIndex(
                name: "IX_Background_FileId",
                schema: "user",
                table: "Background");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfilePhoto_AppFileId",
                schema: "user",
                table: "UserProfilePhoto",
                column: "AppFileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Background_FileId",
                schema: "user",
                table: "Background",
                column: "FileId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserProfilePhoto_AppFileId",
                schema: "user",
                table: "UserProfilePhoto");

            migrationBuilder.DropIndex(
                name: "IX_Background_FileId",
                schema: "user",
                table: "Background");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfilePhoto_AppFileId",
                schema: "user",
                table: "UserProfilePhoto",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_Background_FileId",
                schema: "user",
                table: "Background",
                column: "FileId");
        }
    }
}
