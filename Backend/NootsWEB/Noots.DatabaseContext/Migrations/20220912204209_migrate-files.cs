using Common.DatabaseModels.Models.Files;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class migratefiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PathNonPhotoContent",
                schema: "file",
                table: "AppFile");

            migrationBuilder.DropColumn(
                name: "PathPhotoBig",
                schema: "file",
                table: "AppFile");

            migrationBuilder.RenameColumn(
                name: "PathPhotoSmall",
                schema: "file",
                table: "AppFile",
                newName: "PathPrefix");

            migrationBuilder.RenameColumn(
                name: "PathPhotoMedium",
                schema: "file",
                table: "AppFile",
                newName: "PathFileId");

            migrationBuilder.AddColumn<int>(
                name: "StorageId",
                schema: "user",
                table: "User",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<PathFileSuffixes>(
                name: "PathSuffixes",
                schema: "file",
                table: "AppFile",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StorageId",
                schema: "file",
                table: "AppFile",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Storage",
                schema: "file",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Storage", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "file",
                table: "Storage",
                columns: new[] { "Id", "Name" },
                values: new object[] { 9000, "DEV" });

            migrationBuilder.CreateIndex(
                name: "IX_User_StorageId",
                schema: "user",
                table: "User",
                column: "StorageId");

            migrationBuilder.CreateIndex(
                name: "IX_AppFile_StorageId",
                schema: "file",
                table: "AppFile",
                column: "StorageId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppFile_Storage_StorageId",
                schema: "file",
                table: "AppFile",
                column: "StorageId",
                principalSchema: "file",
                principalTable: "Storage",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Storage_StorageId",
                schema: "user",
                table: "User",
                column: "StorageId",
                principalSchema: "file",
                principalTable: "Storage",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppFile_Storage_StorageId",
                schema: "file",
                table: "AppFile");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Storage_StorageId",
                schema: "user",
                table: "User");

            migrationBuilder.DropTable(
                name: "Storage",
                schema: "file");

            migrationBuilder.DropIndex(
                name: "IX_User_StorageId",
                schema: "user",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_AppFile_StorageId",
                schema: "file",
                table: "AppFile");

            migrationBuilder.DropColumn(
                name: "StorageId",
                schema: "user",
                table: "User");

            migrationBuilder.DropColumn(
                name: "PathSuffixes",
                schema: "file",
                table: "AppFile");

            migrationBuilder.DropColumn(
                name: "StorageId",
                schema: "file",
                table: "AppFile");

            migrationBuilder.RenameColumn(
                name: "PathPrefix",
                schema: "file",
                table: "AppFile",
                newName: "PathPhotoSmall");

            migrationBuilder.RenameColumn(
                name: "PathFileId",
                schema: "file",
                table: "AppFile",
                newName: "PathPhotoMedium");

            migrationBuilder.AddColumn<string>(
                name: "PathNonPhotoContent",
                schema: "file",
                table: "AppFile",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PathPhotoBig",
                schema: "file",
                table: "AppFile",
                type: "text",
                nullable: true);
        }
    }
}
