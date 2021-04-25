using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class changeNameLocation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "BaseNoteContents");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "VideoNote",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "DocumentNote",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "AudioNote",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "VideoNote");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "DocumentNote");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "AudioNote");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "BaseNoteContents",
                type: "text",
                nullable: true);
        }
    }
}
