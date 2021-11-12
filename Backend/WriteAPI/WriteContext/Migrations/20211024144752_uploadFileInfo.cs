using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class uploadFileInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "AppFileUploadInfo",
                schema: "file",
                columns: table => new
                {
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    LinkedDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppFileUploadInfo", x => x.AppFileId);
                    table.ForeignKey(
                        name: "FK_AppFileUploadInfo_AppFile_AppFileId",
                        column: x => x.AppFileId,
                        principalSchema: "file",
                        principalTable: "AppFile",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppFileUploadInfo_AppFileUploadStatus_StatusId",
                        column: x => x.StatusId,
                        principalSchema: "file",
                        principalTable: "AppFileUploadStatus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "file",
                table: "AppFileUploadStatus",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "UnLinked" },
                    { 2, "Linkeed" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppFileUploadInfo_StatusId",
                schema: "file",
                table: "AppFileUploadInfo",
                column: "StatusId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppFileUploadInfo",
                schema: "file");

            migrationBuilder.DropTable(
                name: "AppFileUploadStatus",
                schema: "file");
        }
    }
}
