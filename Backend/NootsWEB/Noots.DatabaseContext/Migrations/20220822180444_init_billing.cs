using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class init_billing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.AddColumn<int>(
                name: "MaxFolders",
                schema: "user",
                table: "BillingPlan",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxLabels",
                schema: "user",
                table: "BillingPlan",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxNotes",
                schema: "user",
                table: "BillingPlan",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxRelatedNotes",
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
                columns: new[] { "MaxFolders", "MaxLabels", "MaxNotes", "MaxRelatedNotes" },
                values: new object[] { 150, 500, 150, 5 });

            migrationBuilder.UpdateData(
                schema: "user",
                table: "BillingPlan",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MaxFolders", "MaxLabels", "MaxNotes", "MaxRelatedNotes" },
                values: new object[] { 10000, 10000, 10000, 30 });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxFolders",
                schema: "user",
                table: "BillingPlan");

            migrationBuilder.DropColumn(
                name: "MaxLabels",
                schema: "user",
                table: "BillingPlan");

            migrationBuilder.DropColumn(
                name: "MaxNotes",
                schema: "user",
                table: "BillingPlan");

            migrationBuilder.DropColumn(
                name: "MaxRelatedNotes",
                schema: "user",
                table: "BillingPlan");

            migrationBuilder.InsertData(
                schema: "user",
                table: "BillingPlan",
                columns: new[] { "Id", "MaxSize", "Name" },
                values: new object[] { 3, 20971520000L, "Business" });
        }
    }
}
