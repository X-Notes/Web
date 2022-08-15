using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WriteContext.Migrations
{
    public partial class relationnotes2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id",
                schema: "note",
                table: "RelatedNoteUserState",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Id",
                schema: "note",
                table: "RelatedNoteUserState");
        }
    }
}
