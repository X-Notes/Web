using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class changeconstraints : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                column: "MaxUserAtSameTimeOnNote",
                value: 40);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxUserAtSameTimeOnFolder", "MaxUserAtSameTimeOnNote" },
                values: new object[] { 10, 5 });

            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 2,
                column: "MaxUserAtSameTimeOnNote",
                value: 20);
        }
    }
}
