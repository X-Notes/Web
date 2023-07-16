using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class refreshtokenIsProcessing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsProcessing",
                schema: "sec",
                table: "RefreshToken",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsProcessing",
                schema: "sec",
                table: "RefreshToken");
        }
    }
}
