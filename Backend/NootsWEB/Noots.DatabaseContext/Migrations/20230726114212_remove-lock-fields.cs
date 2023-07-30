using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class removelockfields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Password",
                schema: "note",
                table: "Note");

            migrationBuilder.DropColumn(
                name: "UnlockTime",
                schema: "note",
                table: "Note");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Password",
                schema: "note",
                table: "Note",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UnlockTime",
                schema: "note",
                table: "Note",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
