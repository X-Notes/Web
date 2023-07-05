using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class initversionnotefolder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Version",
                schema: "note",
                table: "Note",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                schema: "folder",
                table: "Folder",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxBackgrounds",
                schema: "user",
                table: "BillingPlan",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxUserAtSameTimeOnFolder",
                schema: "user",
                table: "BillingPlan",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxUserAtSameTimeOnNote",
                schema: "user",
                table: "BillingPlan",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxBackgrounds", "MaxUserAtSameTimeOnFolder", "MaxUserAtSameTimeOnNote" },
                values: new object[] { 5, 10, 5 });

            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MaxBackgrounds", "MaxUserAtSameTimeOnFolder", "MaxUserAtSameTimeOnNote" },
                values: new object[] { 20, 50, 20 });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Version",
                schema: "note",
                table: "Note");

            migrationBuilder.DropColumn(
                name: "Version",
                schema: "folder",
                table: "Folder");

            migrationBuilder.DropColumn(
                name: "MaxBackgrounds",
                schema: "user",
                table: "BillingPlan");

            migrationBuilder.DropColumn(
                name: "MaxUserAtSameTimeOnFolder",
                schema: "user",
                table: "BillingPlan");

            migrationBuilder.DropColumn(
                name: "MaxUserAtSameTimeOnNote",
                schema: "user",
                table: "BillingPlan");
        }
    }
}
