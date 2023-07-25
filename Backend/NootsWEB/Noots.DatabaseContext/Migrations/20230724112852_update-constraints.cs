using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class updateconstraints : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxBackgrounds", "MaxFolders", "MaxLabels", "MaxNotes" },
                values: new object[] { 10, 40, 100, 160 });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxBackgrounds", "MaxFolders", "MaxLabels", "MaxNotes" },
                values: new object[] { 5, 250, 500, 250 });
        }
    }
}
