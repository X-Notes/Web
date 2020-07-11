using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class deletepeople : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RelantionShips");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RelantionShips",
                columns: table => new
                {
                    FirstUserId = table.Column<int>(type: "integer", nullable: false),
                    SecondUserId = table.Column<int>(type: "integer", nullable: false),
                    ActionUserId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelantionShips", x => new { x.FirstUserId, x.SecondUserId });
                    table.ForeignKey(
                        name: "FK_RelantionShips_Users_ActionUserId",
                        column: x => x.ActionUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RelantionShips_Users_FirstUserId",
                        column: x => x.FirstUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RelantionShips_Users_SecondUserId",
                        column: x => x.SecondUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RelantionShips_ActionUserId",
                table: "RelantionShips",
                column: "ActionUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RelantionShips_SecondUserId",
                table: "RelantionShips",
                column: "SecondUserId");
        }
    }
}
