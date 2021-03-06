using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class fixlist : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_NextId1",
                table: "BaseNoteContents");

            migrationBuilder.DropIndex(
                name: "IX_BaseNoteContents_NextId1",
                table: "BaseNoteContents");

            migrationBuilder.DropColumn(
                name: "NextId1",
                table: "BaseNoteContents");

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_PrevId",
                table: "BaseNoteContents",
                column: "PrevId");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_PrevId",
                table: "BaseNoteContents",
                column: "PrevId",
                principalTable: "BaseNoteContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_PrevId",
                table: "BaseNoteContents");

            migrationBuilder.DropIndex(
                name: "IX_BaseNoteContents_PrevId",
                table: "BaseNoteContents");

            migrationBuilder.AddColumn<Guid>(
                name: "NextId1",
                table: "BaseNoteContents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NextId1",
                table: "BaseNoteContents",
                column: "NextId1");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_NextId1",
                table: "BaseNoteContents",
                column: "NextId1",
                principalTable: "BaseNoteContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
