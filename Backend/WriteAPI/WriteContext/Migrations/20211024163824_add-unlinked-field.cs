using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class addunlinkedfield : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UnLinkedDate",
                schema: "file",
                table: "AppFileUploadInfo",
                type: "timestamp with time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnLinkedDate",
                schema: "file",
                table: "AppFileUploadInfo");
        }
    }
}
