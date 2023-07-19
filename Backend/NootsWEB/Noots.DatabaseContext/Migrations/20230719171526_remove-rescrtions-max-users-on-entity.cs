using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class removerescrtionsmaxusersonentity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxUserAtSameTimeOnFolder",
                schema: "user",
                table: "BillingPlan");

            migrationBuilder.DropColumn(
                name: "MaxUserAtSameTimeOnNote",
                schema: "user",
                table: "BillingPlan");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                columns: new[] { "MaxUserAtSameTimeOnFolder", "MaxUserAtSameTimeOnNote" },
                values: new object[] { 20, 10 });

            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MaxUserAtSameTimeOnFolder", "MaxUserAtSameTimeOnNote" },
                values: new object[] { 50, 40 });
        }
    }
}
