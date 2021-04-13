using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class fix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlbumNote_BaseNoteContents_Id_NoteId",
                table: "AlbumNote");

            migrationBuilder.DropForeignKey(
                name: "FK_AlbumNote_Notes_NoteId",
                table: "AlbumNote");

            migrationBuilder.DropForeignKey(
                name: "FK_AlbumNoteAppFile_AlbumNote_AlbumNotesId_AlbumNotesNoteId",
                table: "AlbumNoteAppFile");

            migrationBuilder.DropForeignKey(
                name: "FK_TextNote_BaseNoteContents_Id_NoteId",
                table: "TextNote");

            migrationBuilder.DropForeignKey(
                name: "FK_TextNote_Notes_NoteId",
                table: "TextNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TextNote",
                table: "TextNote");

            migrationBuilder.DropIndex(
                name: "IX_TextNote_NoteId",
                table: "TextNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BaseNoteContents",
                table: "BaseNoteContents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AlbumNoteAppFile",
                table: "AlbumNoteAppFile");

            migrationBuilder.DropIndex(
                name: "IX_AlbumNoteAppFile_AlbumNotesId_AlbumNotesNoteId",
                table: "AlbumNoteAppFile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AlbumNote",
                table: "AlbumNote");

            migrationBuilder.DropIndex(
                name: "IX_AlbumNote_NoteId",
                table: "AlbumNote");

            migrationBuilder.DropColumn(
                name: "NoteId",
                table: "TextNote");

            migrationBuilder.DropColumn(
                name: "AlbumNotesNoteId",
                table: "AlbumNoteAppFile");

            migrationBuilder.DropColumn(
                name: "NoteId",
                table: "AlbumNote");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TextNote",
                table: "TextNote",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BaseNoteContents",
                table: "BaseNoteContents",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AlbumNoteAppFile",
                table: "AlbumNoteAppFile",
                columns: new[] { "AlbumNotesId", "PhotosId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_AlbumNote",
                table: "AlbumNote",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumNoteAppFile_PhotosId",
                table: "AlbumNoteAppFile",
                column: "PhotosId");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNote_BaseNoteContents_Id",
                table: "AlbumNote",
                column: "Id",
                principalTable: "BaseNoteContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFile_AlbumNote_AlbumNotesId",
                table: "AlbumNoteAppFile",
                column: "AlbumNotesId",
                principalTable: "AlbumNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TextNote_BaseNoteContents_Id",
                table: "TextNote",
                column: "Id",
                principalTable: "BaseNoteContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlbumNote_BaseNoteContents_Id",
                table: "AlbumNote");

            migrationBuilder.DropForeignKey(
                name: "FK_AlbumNoteAppFile_AlbumNote_AlbumNotesId",
                table: "AlbumNoteAppFile");

            migrationBuilder.DropForeignKey(
                name: "FK_TextNote_BaseNoteContents_Id",
                table: "TextNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TextNote",
                table: "TextNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BaseNoteContents",
                table: "BaseNoteContents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AlbumNoteAppFile",
                table: "AlbumNoteAppFile");

            migrationBuilder.DropIndex(
                name: "IX_AlbumNoteAppFile_PhotosId",
                table: "AlbumNoteAppFile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AlbumNote",
                table: "AlbumNote");

            migrationBuilder.AddColumn<Guid>(
                name: "NoteId",
                table: "TextNote",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "AlbumNotesNoteId",
                table: "AlbumNoteAppFile",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "NoteId",
                table: "AlbumNote",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_TextNote",
                table: "TextNote",
                columns: new[] { "Id", "NoteId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_BaseNoteContents",
                table: "BaseNoteContents",
                columns: new[] { "Id", "NoteId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_AlbumNoteAppFile",
                table: "AlbumNoteAppFile",
                columns: new[] { "PhotosId", "AlbumNotesId", "AlbumNotesNoteId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_AlbumNote",
                table: "AlbumNote",
                columns: new[] { "Id", "NoteId" });

            migrationBuilder.CreateIndex(
                name: "IX_TextNote_NoteId",
                table: "TextNote",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumNoteAppFile_AlbumNotesId_AlbumNotesNoteId",
                table: "AlbumNoteAppFile",
                columns: new[] { "AlbumNotesId", "AlbumNotesNoteId" });

            migrationBuilder.CreateIndex(
                name: "IX_AlbumNote_NoteId",
                table: "AlbumNote",
                column: "NoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNote_BaseNoteContents_Id_NoteId",
                table: "AlbumNote",
                columns: new[] { "Id", "NoteId" },
                principalTable: "BaseNoteContents",
                principalColumns: new[] { "Id", "NoteId" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNote_Notes_NoteId",
                table: "AlbumNote",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFile_AlbumNote_AlbumNotesId_AlbumNotesNoteId",
                table: "AlbumNoteAppFile",
                columns: new[] { "AlbumNotesId", "AlbumNotesNoteId" },
                principalTable: "AlbumNote",
                principalColumns: new[] { "Id", "NoteId" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TextNote_BaseNoteContents_Id_NoteId",
                table: "TextNote",
                columns: new[] { "Id", "NoteId" },
                principalTable: "BaseNoteContents",
                principalColumns: new[] { "Id", "NoteId" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TextNote_Notes_NoteId",
                table: "TextNote",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
