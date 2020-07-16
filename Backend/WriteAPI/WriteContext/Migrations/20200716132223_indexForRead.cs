using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class indexForRead : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Notes_ReadId",
                table: "Notes",
                column: "ReadId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notes_ReadId",
                table: "Notes");
        }
    }
}
