using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class background2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                table: "Users");

            migrationBuilder.AlterColumn<int>(
                name: "CurrentBackgroundId",
                table: "Users",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                table: "Users",
                column: "CurrentBackgroundId",
                principalTable: "Backgrounds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                table: "Users");

            migrationBuilder.AlterColumn<int>(
                name: "CurrentBackgroundId",
                table: "Users",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                table: "Users",
                column: "CurrentBackgroundId",
                principalTable: "Backgrounds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
