using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class relationOrder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_NoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNote_Notes_RelatedNoteId",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ReletatedNoteToInnerNote",
                table: "ReletatedNoteToInnerNote");

            migrationBuilder.RenameTable(
                name: "ReletatedNoteToInnerNote",
                newName: "ReletatedNoteToInnerNotes");

            migrationBuilder.RenameIndex(
                name: "IX_ReletatedNoteToInnerNote_RelatedNoteId",
                table: "ReletatedNoteToInnerNotes",
                newName: "IX_ReletatedNoteToInnerNotes_RelatedNoteId");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "ReletatedNoteToInnerNotes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "NextId",
                table: "ReletatedNoteToInnerNotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PrevId",
                table: "ReletatedNoteToInnerNotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ReletatedNoteToInnerNotes_Id",
                table: "ReletatedNoteToInnerNotes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReletatedNoteToInnerNotes",
                table: "ReletatedNoteToInnerNotes",
                columns: new[] { "NoteId", "RelatedNoteId" });

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNotes_NextId",
                table: "ReletatedNoteToInnerNotes",
                column: "NextId");

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNotes_PrevId",
                table: "ReletatedNoteToInnerNotes",
                column: "PrevId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_Notes_NoteId",
                table: "ReletatedNoteToInnerNotes",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_Notes_RelatedNoteId",
                table: "ReletatedNoteToInnerNotes",
                column: "RelatedNoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_ReletatedNoteToInnerNotes_Notes_NoteId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_Notes_RelatedNoteId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_ReletatedNoteToInnerNotes_NextId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_ReletatedNoteToInnerNotes_ReletatedNoteToInnerNotes_PrevId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ReletatedNoteToInnerNotes_Id",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ReletatedNoteToInnerNotes",
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

            migrationBuilder.DropColumn(
                name: "NextId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropColumn(
                name: "PrevId",
                table: "ReletatedNoteToInnerNotes");

            migrationBuilder.RenameTable(
                name: "ReletatedNoteToInnerNotes",
                newName: "ReletatedNoteToInnerNote");

            migrationBuilder.RenameIndex(
                name: "IX_ReletatedNoteToInnerNotes_RelatedNoteId",
                table: "ReletatedNoteToInnerNote",
                newName: "IX_ReletatedNoteToInnerNote_RelatedNoteId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReletatedNoteToInnerNote",
                table: "ReletatedNoteToInnerNote",
                columns: new[] { "NoteId", "RelatedNoteId" });

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
    }
}
