using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class addfileds : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Height",
                table: "AlbumNote",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Width",
                table: "AlbumNote",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Height",
                table: "AlbumNote");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "AlbumNote");
        }
    }
}
