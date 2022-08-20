using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WriteContext.Migrations
{
    public partial class nulluserws3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserIdentifierConnectionId_User_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserIdentifierConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.AlterColumn<string>(
                name: "ConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserIdentifierConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_UserIdentifierConnectionId_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserIdentifierConnectionId_User_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                column: "UserId",
                principalSchema: "user",
                principalTable: "User",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserIdentifierConnectionId_User_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserIdentifierConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.DropIndex(
                name: "IX_UserIdentifierConnectionId_UserId",
                schema: "ws",
                table: "UserIdentifierConnectionId");

            migrationBuilder.DropColumn(
                name: "Id",
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

            migrationBuilder.AlterColumn<string>(
                name: "ConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserIdentifierConnectionId",
                schema: "ws",
                table: "UserIdentifierConnectionId",
                columns: new[] { "UserId", "ConnectionId" });

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
    }
}
