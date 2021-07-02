using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class sortingnotesfolders : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsViewVideoOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewTextOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewPhotosOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewDocumentOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewAudioOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "SortedFolderByTypeId",
                table: "PersonalizationSettings",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "SortedNoteByTypeId",
                table: "PersonalizationSettings",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateTable(
                name: "SortedByTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SortedByTypes", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "SortedByTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "AscDate" },
                    { 2, "DescDate" },
                    { 3, "CustomOrder" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizationSettings_SortedFolderByTypeId",
                table: "PersonalizationSettings",
                column: "SortedFolderByTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizationSettings_SortedNoteByTypeId",
                table: "PersonalizationSettings",
                column: "SortedNoteByTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalizationSettings_SortedByTypes_SortedFolderByTypeId",
                table: "PersonalizationSettings",
                column: "SortedFolderByTypeId",
                principalTable: "SortedByTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalizationSettings_SortedByTypes_SortedNoteByTypeId",
                table: "PersonalizationSettings",
                column: "SortedNoteByTypeId",
                principalTable: "SortedByTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonalizationSettings_SortedByTypes_SortedFolderByTypeId",
                table: "PersonalizationSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonalizationSettings_SortedByTypes_SortedNoteByTypeId",
                table: "PersonalizationSettings");

            migrationBuilder.DropTable(
                name: "SortedByTypes");

            migrationBuilder.DropIndex(
                name: "IX_PersonalizationSettings_SortedFolderByTypeId",
                table: "PersonalizationSettings");

            migrationBuilder.DropIndex(
                name: "IX_PersonalizationSettings_SortedNoteByTypeId",
                table: "PersonalizationSettings");

            migrationBuilder.DropColumn(
                name: "SortedFolderByTypeId",
                table: "PersonalizationSettings");

            migrationBuilder.DropColumn(
                name: "SortedNoteByTypeId",
                table: "PersonalizationSettings");

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewVideoOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewTextOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewPhotosOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewDocumentOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "IsViewAudioOnNote",
                table: "PersonalizationSettings",
                type: "boolean",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "boolean");
        }
    }
}
