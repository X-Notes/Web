using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WriteContext.Migrations
{
    public partial class removeuselesss : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppFileUploadInfo_AppFileUploadStatus_StatusId",
                schema: "file",
                table: "AppFileUploadInfo");

            migrationBuilder.DropTable(
                name: "AppFileUploadStatus",
                schema: "file");

            migrationBuilder.DropIndex(
                name: "IX_AppFileUploadInfo_StatusId",
                schema: "file",
                table: "AppFileUploadInfo");

            migrationBuilder.DropColumn(
                name: "StatusId",
                schema: "file",
                table: "AppFileUploadInfo");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                schema: "file",
                table: "AppFileUploadInfo",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AppFileUploadStatus",
                schema: "file",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppFileUploadStatus", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "file",
                table: "AppFileUploadStatus",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "UnLinked" },
                    { 2, "Linked" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppFileUploadInfo_StatusId",
                schema: "file",
                table: "AppFileUploadInfo",
                column: "StatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppFileUploadInfo_AppFileUploadStatus_StatusId",
                schema: "file",
                table: "AppFileUploadInfo",
                column: "StatusId",
                principalSchema: "file",
                principalTable: "AppFileUploadStatus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
