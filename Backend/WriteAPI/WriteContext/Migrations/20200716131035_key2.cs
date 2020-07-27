using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class key2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserOnNote_Notes_NoteWriteId_NoteReadId",
                table: "UserOnNote");

            migrationBuilder.DropIndex(
                name: "IX_UserOnNote_NoteWriteId_NoteReadId",
                table: "UserOnNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notes",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "NoteReadId",
                table: "UserOnNote");

            migrationBuilder.DropColumn(
                name: "NoteWriteId",
                table: "UserOnNote");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notes",
                table: "Notes",
                column: "WriteId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnNote_NoteId",
                table: "UserOnNote",
                column: "NoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserOnNote_Notes_NoteId",
                table: "UserOnNote",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "WriteId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserOnNote_Notes_NoteId",
                table: "UserOnNote");

            migrationBuilder.DropIndex(
                name: "IX_UserOnNote_NoteId",
                table: "UserOnNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notes",
                table: "Notes");

            migrationBuilder.AddColumn<Guid>(
                name: "NoteReadId",
                table: "UserOnNote",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NoteWriteId",
                table: "UserOnNote",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notes",
                table: "Notes",
                columns: new[] { "WriteId", "ReadId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserOnNote_NoteWriteId_NoteReadId",
                table: "UserOnNote",
                columns: new[] { "NoteWriteId", "NoteReadId" });

            migrationBuilder.AddForeignKey(
                name: "FK_UserOnNote_Notes_NoteWriteId_NoteReadId",
                table: "UserOnNote",
                columns: new[] { "NoteWriteId", "NoteReadId" },
                principalTable: "Notes",
                principalColumns: new[] { "WriteId", "ReadId" },
                onDelete: ReferentialAction.Restrict);
        }
    }
}
