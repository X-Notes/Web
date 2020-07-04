using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class background : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentBackgroundId",
                table: "Users",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Users_CurrentBackgroundId",
                table: "Users",
                column: "CurrentBackgroundId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                table: "Users",
                column: "CurrentBackgroundId",
                principalTable: "Backgrounds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_CurrentBackgroundId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentBackgroundId",
                table: "Users");
        }
    }
}
