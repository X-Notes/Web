using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class billing_plans_renaming : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Standart");

            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Premium");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Free");

            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Standart");
        }
    }
}
