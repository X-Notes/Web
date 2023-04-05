using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class updatefieldws : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Connected",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedAt",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.AddColumn<bool>(
                name: "Connected",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
