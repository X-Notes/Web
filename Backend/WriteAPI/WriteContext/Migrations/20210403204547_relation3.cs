using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class relation3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId1",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropIndex(
                name: "IX_ReletatedNoteToInnerNote_NoteId1",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropColumn(
                name: "NoteId1",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNote_RelatedNoteId",
                table: "ReletatedNoteToInnerNote",
                column: "RelatedNoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_RelatedNoteId",
                table: "ReletatedNoteToInnerNote",
                column: "RelatedNoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_RelatedNoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropIndex(
                name: "IX_ReletatedNoteToInnerNote_RelatedNoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.AddColumn<Guid>(
                name: "NoteId1",
                table: "ReletatedNoteToInnerNote",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNote_NoteId1",
                table: "ReletatedNoteToInnerNote",
                column: "NoteId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId1",
                table: "ReletatedNoteToInnerNote",
                column: "NoteId1",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
