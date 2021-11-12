using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class adddatafileuploadstatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                schema: "file",
                table: "AppFileUploadInfo",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                schema: "file",
                table: "AppFileUploadStatus",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Linked");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "file",
                table: "AppFileUploadInfo");

            migrationBuilder.UpdateData(
                schema: "file",
                table: "AppFileUploadStatus",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Linkeed");
        }
    }
}
