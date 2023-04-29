using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class initmaxsizebillingstandart : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                column: "MaxSize",
                value: 104857600L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                column: "MaxSize",
                value: 1048576000L);
        }
    }
}
