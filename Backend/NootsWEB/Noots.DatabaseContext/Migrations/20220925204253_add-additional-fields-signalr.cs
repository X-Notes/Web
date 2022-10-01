using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class addadditionalfieldssignalr : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Connected",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Connected",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                schema: "ws",
                table: "UserIdentifierConnectionId");
        }
    }
}
