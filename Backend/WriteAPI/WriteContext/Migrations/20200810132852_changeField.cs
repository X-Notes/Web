using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class changeField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NoteType",
                table: "Folders");

            migrationBuilder.AddColumn<int>(
                name: "FolderType",
                table: "Folders",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FolderType",
                table: "Folders");

            migrationBuilder.AddColumn<int>(
                name: "NoteType",
                table: "Folders",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
