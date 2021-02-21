using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class fontSizeTheme : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PersonalitionSettings");

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("9c615562-7eb4-4ba8-86cf-ee5f109301a3"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("e526f629-0fa3-4873-9bde-a93d15ea3e18"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("fca983ad-816d-4c6b-9f3d-ec0795ef1eed"));

            migrationBuilder.AddColumn<Guid>(
                name: "FontSizeId",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ThemeId",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "FontSizes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FontSizes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Themes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Themes", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("6a5537fe-49cb-4a69-bcca-ce0745e156d0"), "Medium" },
                    { new Guid("df2921ad-518c-423e-95e7-951be910cb97"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("bc183ce0-1abc-4240-838f-efd519da6e07"), "Ukraine" },
                    { new Guid("b9bb6709-58aa-4b81-883b-b933b1d807cf"), "Russian" },
                    { new Guid("d026cee1-e382-405b-b25f-2aabc4ecbbda"), "English" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("2b38b31c-049c-4c24-be71-e12f178d2c94"), "Light" },
                    { new Guid("52f3b68d-bd35-4fd4-bea7-adb042416d01"), "Dark" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_FontSizeId",
                table: "Users",
                column: "FontSizeId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ThemeId",
                table: "Users",
                column: "ThemeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_FontSizes_FontSizeId",
                table: "Users",
                column: "FontSizeId",
                principalTable: "FontSizes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Themes_ThemeId",
                table: "Users",
                column: "ThemeId",
                principalTable: "Themes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_FontSizes_FontSizeId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Themes_ThemeId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "FontSizes");

            migrationBuilder.DropTable(
                name: "Themes");

            migrationBuilder.DropIndex(
                name: "IX_Users_FontSizeId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_ThemeId",
                table: "Users");

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("b9bb6709-58aa-4b81-883b-b933b1d807cf"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("bc183ce0-1abc-4240-838f-efd519da6e07"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("d026cee1-e382-405b-b25f-2aabc4ecbbda"));

            migrationBuilder.DropColumn(
                name: "FontSizeId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ThemeId",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "PersonalitionSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FontSize = table.Column<int>(type: "integer", nullable: false),
                    Theme = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalitionSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalitionSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("e526f629-0fa3-4873-9bde-a93d15ea3e18"), "Ukraine" },
                    { new Guid("9c615562-7eb4-4ba8-86cf-ee5f109301a3"), "Russian" },
                    { new Guid("fca983ad-816d-4c6b-9f3d-ec0795ef1eed"), "English" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonalitionSettings_UserId",
                table: "PersonalitionSettings",
                column: "UserId",
                unique: true);
        }
    }
}
