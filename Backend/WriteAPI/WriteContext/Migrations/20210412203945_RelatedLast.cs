using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class RelatedLast : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Id",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropColumn(
                name: "NextId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropColumn(
                name: "PrevId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "ReletatedNoteToInnerNotes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "ReletatedNoteToInnerNotes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "NextId",
                table: "ReletatedNoteToInnerNotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PrevId",
                table: "ReletatedNoteToInnerNotes",
                type: "uuid",
                nullable: true);
        }
    }
}
