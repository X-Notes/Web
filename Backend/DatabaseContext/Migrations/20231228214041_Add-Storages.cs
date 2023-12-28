using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DatabaseContext.Migrations
{
    /// <inheritdoc />
    public partial class AddStorages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "file",
                table: "Storage",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 9010, "Qa" },
                    { 9020, "Prod" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "file",
                table: "Storage",
                keyColumn: "Id",
                keyValue: 9010);

            migrationBuilder.DeleteData(
                schema: "file",
                table: "Storage",
                keyColumn: "Id",
                keyValue: 9020);
        }
    }
}
