using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class updatememorysize : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "Noots",
                table: "BillingPlans",
                keyColumn: "Id",
                keyValue: 1,
                column: "MaxSize",
                value: 1048576000L);

            migrationBuilder.UpdateData(
                schema: "Noots",
                table: "BillingPlans",
                keyColumn: "Id",
                keyValue: 2,
                column: "MaxSize",
                value: 5242880000L);

            migrationBuilder.UpdateData(
                schema: "Noots",
                table: "BillingPlans",
                keyColumn: "Id",
                keyValue: 3,
                column: "MaxSize",
                value: 20971520000L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "Noots",
                table: "BillingPlans",
                keyColumn: "Id",
                keyValue: 1,
                column: "MaxSize",
                value: 1000000000L);

            migrationBuilder.UpdateData(
                schema: "Noots",
                table: "BillingPlans",
                keyColumn: "Id",
                keyValue: 2,
                column: "MaxSize",
                value: 5000000000L);

            migrationBuilder.UpdateData(
                schema: "Noots",
                table: "BillingPlans",
                keyColumn: "Id",
                keyValue: 3,
                column: "MaxSize",
                value: 20000000000L);
        }
    }
}
