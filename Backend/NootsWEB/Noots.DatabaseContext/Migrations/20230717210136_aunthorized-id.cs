using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class aunthorizedid : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserIdentifierConnectionId_User_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.DropColumn(
                name: "UnauthorizedId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserIdentifierConnectionId_User_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                column: "UserId",
                principalSchema: "user",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserIdentifierConnectionId_User_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "UnauthorizedId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserIdentifierConnectionId_User_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                column: "UserId",
                principalSchema: "user",
                principalTable: "User",
                principalColumn: "Id");
        }
    }
}
