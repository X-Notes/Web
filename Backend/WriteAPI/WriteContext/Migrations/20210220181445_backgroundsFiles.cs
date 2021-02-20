using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class backgroundsFiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Path",
                table: "Backgrounds");

            migrationBuilder.AddColumn<Guid>(
                name: "FileId",
                table: "Backgrounds",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileId",
                table: "Backgrounds");

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "Backgrounds",
                type: "text",
                nullable: true);
        }
    }
}
