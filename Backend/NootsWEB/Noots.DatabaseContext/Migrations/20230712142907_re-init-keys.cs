using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class reinitkeys : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshToken",
                schema: "sec",
                table: "RefreshToken");

            migrationBuilder.DropIndex(
                name: "IX_RefreshToken_UserId",
                schema: "sec",
                table: "RefreshToken");

            migrationBuilder.DropColumn(
                name: "Id",
                schema: "sec",
                table: "RefreshToken");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshToken",
                schema: "sec",
                table: "RefreshToken",
                columns: new[] { "UserId", "TokenString" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshToken",
                schema: "sec",
                table: "RefreshToken");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                schema: "sec",
                table: "RefreshToken",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshToken",
                schema: "sec",
                table: "RefreshToken",
                columns: new[] { "Id", "TokenString" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId",
                schema: "sec",
                table: "RefreshToken",
                column: "UserId");
        }
    }
}
