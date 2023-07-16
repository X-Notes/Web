using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class addtokens : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "sec");

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                schema: "sec",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    TokenString = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpireAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => new { x.Id, x.TokenString });
                    table.ForeignKey(
                        name: "FK_RefreshToken_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "user",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId",
                schema: "sec",
                table: "RefreshToken",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefreshToken",
                schema: "sec");
        }
    }
}
