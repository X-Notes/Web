using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class addtextnoteindex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TextNoteIndex",
                schema: "note_content",
                columns: table => new
                {
                    TextNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextNoteIndex", x => x.TextNoteId);
                    table.ForeignKey(
                        name: "FK_TextNoteIndex_TextNote_TextNoteId",
                        column: x => x.TextNoteId,
                        principalSchema: "note_content",
                        principalTable: "TextNote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TextNoteIndex",
                schema: "note_content");
        }
    }
}
