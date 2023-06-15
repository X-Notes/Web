using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class dropcolumnrelateduserstate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RelatedNoteUserState_RelatedNoteToInnerNote_RelatedNoteInne~",
                schema: "note",
                table: "RelatedNoteUserState");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RelatedNoteUserState",
                schema: "note",
                table: "RelatedNoteUserState");

            migrationBuilder.DropColumn(
                name: "ReletatedNoteInnerNoteId",
                schema: "note",
                table: "RelatedNoteUserState");

            migrationBuilder.AlterColumn<int>(
                name: "RelatedNoteInnerNoteId",
                schema: "note",
                table: "RelatedNoteUserState",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_RelatedNoteUserState",
                schema: "note",
                table: "RelatedNoteUserState",
                columns: new[] { "UserId", "RelatedNoteInnerNoteId" });

            migrationBuilder.AddForeignKey(
                name: "FK_RelatedNoteUserState_RelatedNoteToInnerNote_RelatedNoteInne~",
                schema: "note",
                table: "RelatedNoteUserState",
                column: "RelatedNoteInnerNoteId",
                principalSchema: "note",
                principalTable: "RelatedNoteToInnerNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RelatedNoteUserState_RelatedNoteToInnerNote_RelatedNoteInne~",
                schema: "note",
                table: "RelatedNoteUserState");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RelatedNoteUserState",
                schema: "note",
                table: "RelatedNoteUserState");

            migrationBuilder.AlterColumn<int>(
                name: "RelatedNoteInnerNoteId",
                schema: "note",
                table: "RelatedNoteUserState",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "ReletatedNoteInnerNoteId",
                schema: "note",
                table: "RelatedNoteUserState",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_RelatedNoteUserState",
                schema: "note",
                table: "RelatedNoteUserState",
                columns: new[] { "UserId", "ReletatedNoteInnerNoteId" });

            migrationBuilder.AddForeignKey(
                name: "FK_RelatedNoteUserState_RelatedNoteToInnerNote_RelatedNoteInne~",
                schema: "note",
                table: "RelatedNoteUserState",
                column: "RelatedNoteInnerNoteId",
                principalSchema: "note",
                principalTable: "RelatedNoteToInnerNote",
                principalColumn: "Id");
        }
    }
}
