using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class locknote3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NoteLockState",
                schema: "note");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UnlockTime",
                schema: "note",
                table: "Note",
                type: "timestamp with time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnlockTime",
                schema: "note",
                table: "Note");

            migrationBuilder.CreateTable(
                name: "NoteLockState",
                schema: "note",
                columns: table => new
                {
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnlockTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteLockState", x => x.NoteId);
                    table.ForeignKey(
                        name: "FK_NoteLockState_Note_NoteId",
                        column: x => x.NoteId,
                        principalSchema: "note",
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }
    }
}
