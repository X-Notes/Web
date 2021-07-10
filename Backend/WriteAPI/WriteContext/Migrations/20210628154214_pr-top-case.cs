using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class prtopcase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isViewVideoOnNote",
                table: "PersonalizationSettings",
                newName: "IsViewVideoOnNote");

            migrationBuilder.RenameColumn(
                name: "isViewTextOnNote",
                table: "PersonalizationSettings",
                newName: "IsViewTextOnNote");

            migrationBuilder.RenameColumn(
                name: "isViewPhotosOnNote",
                table: "PersonalizationSettings",
                newName: "IsViewPhotosOnNote");

            migrationBuilder.RenameColumn(
                name: "isViewDocumentOnNote",
                table: "PersonalizationSettings",
                newName: "IsViewDocumentOnNote");

            migrationBuilder.RenameColumn(
                name: "isViewAudioOnNote",
                table: "PersonalizationSettings",
                newName: "IsViewAudioOnNote");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsViewVideoOnNote",
                table: "PersonalizationSettings",
                newName: "isViewVideoOnNote");

            migrationBuilder.RenameColumn(
                name: "IsViewTextOnNote",
                table: "PersonalizationSettings",
                newName: "isViewTextOnNote");

            migrationBuilder.RenameColumn(
                name: "IsViewPhotosOnNote",
                table: "PersonalizationSettings",
                newName: "isViewPhotosOnNote");

            migrationBuilder.RenameColumn(
                name: "IsViewDocumentOnNote",
                table: "PersonalizationSettings",
                newName: "isViewDocumentOnNote");

            migrationBuilder.RenameColumn(
                name: "IsViewAudioOnNote",
                table: "PersonalizationSettings",
                newName: "isViewAudioOnNote");
        }
    }
}
