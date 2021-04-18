using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class relationToKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "ReletatedNoteToInnerNotes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ReletatedNoteToInnerNotes_Id",
                table: "ReletatedNoteToInnerNotes",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNotes_NextId",
                table: "ReletatedNoteToInnerNotes",
                column: "NextId");

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNotes_PrevId",
                table: "ReletatedNoteToInnerNotes",
                column: "PrevId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_ReletatedNoteToInnerNotes_NextId",
                table: "ReletatedNoteToInnerNotes",
                column: "NextId",
                principalTable: "ReletatedNoteToInnerNotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_ReletatedNoteToInnerNotes_PrevId",
                table: "ReletatedNoteToInnerNotes",
                column: "PrevId",
                principalTable: "ReletatedNoteToInnerNotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_ReletatedNoteToInnerNotes_NextId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_ReletatedNoteToInnerNotes_PrevId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ReletatedNoteToInnerNotes_Id",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropIndex(
                name: "IX_ReletatedNoteToInnerNotes_NextId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropIndex(
                name: "IX_ReletatedNoteToInnerNotes_PrevId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "ReletatedNoteToInnerNotes");
        }
    }
}
