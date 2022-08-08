using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WriteContext.Migrations
{
    public partial class addlanguages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "noots_systems",
                table: "Language",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 4, "Spanish" },
                    { 5, "French" },
                    { 6, "Italian" },
                    { 7, "German" },
                    { 8, "Swedish" },
                    { 9, "Polish" },
                    { 10, "Chinese" },
                    { 11, "Japan" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                schema: "noots_systems",
                table: "Language",
                keyColumn: "Id",
                keyValue: 11);
        }
    }
}
