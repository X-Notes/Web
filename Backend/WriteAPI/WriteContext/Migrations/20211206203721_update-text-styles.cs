using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class updatetextstyles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                schema: "note_content",
                table: "TextNote");

            migrationBuilder.DropColumn(
                name: "IsBold",
                schema: "note_content",
                table: "TextNote");

            migrationBuilder.DropColumn(
                name: "IsItalic",
                schema: "note_content",
                table: "TextNote");

            migrationBuilder.AddColumn<List<TextBlock>>(
                name: "Contents",
                schema: "note_content",
                table: "TextNote",
                type: "jsonb",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Contents",
                schema: "note_content",
                table: "TextNote");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                schema: "note_content",
                table: "TextNote",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBold",
                schema: "note_content",
                table: "TextNote",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsItalic",
                schema: "note_content",
                table: "TextNote",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
