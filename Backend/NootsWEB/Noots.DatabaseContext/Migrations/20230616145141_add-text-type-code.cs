using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class addtexttypecode : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "note_content",
                table: "NoteTextType",
                columns: new[] { "Id", "Name" },
                values: new object[] { 6, "Code" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "note_content",
                table: "NoteTextType",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
