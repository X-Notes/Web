using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WriteContext.Migrations
{
    public partial class relationnotes3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Id",
                schema: "note",
                table: "RelatedNoteUserState");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id",
                schema: "note",
                table: "RelatedNoteUserState",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
