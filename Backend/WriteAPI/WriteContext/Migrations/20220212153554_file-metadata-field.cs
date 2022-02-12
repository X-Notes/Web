using Common.DatabaseModels.Models.Files;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class filemetadatafield : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecognizeObject",
                schema: "file",
                table: "AppFile");

            migrationBuilder.DropColumn(
                name: "TextFromPhoto",
                schema: "file",
                table: "AppFile");

            migrationBuilder.AddColumn<AppFileMetaData>(
                name: "MetaData",
                schema: "file",
                table: "AppFile",
                type: "jsonb",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MetaData",
                schema: "file",
                table: "AppFile");

            migrationBuilder.AddColumn<string>(
                name: "RecognizeObject",
                schema: "file",
                table: "AppFile",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextFromPhoto",
                schema: "file",
                table: "AppFile",
                type: "text",
                nullable: true);
        }
    }
}
