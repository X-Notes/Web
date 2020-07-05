using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace WriteContext.Migrations
{
    public partial class folder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RelantionShips_Users_FirstUserId",
                table: "RelantionShips");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Label",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Folder",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(nullable: true),
                    Color = table.Column<string>(nullable: true),
                    UserId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Folder", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Folder_Users_UserId",
                        column: x => x.UserId,
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

            migrationBuilder.CreateIndex(
                name: "IX_Folder_UserId",
                table: "Folder",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_RelantionShips_Users_ActionUserId",
                table: "RelantionShips",
                column: "ActionUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RelantionShips_Users_FirstUserId",
                table: "RelantionShips",
                column: "FirstUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RelantionShips_Users_SecondUserId",
                table: "RelantionShips",
                column: "SecondUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RelantionShips_Users_ActionUserId",
                table: "RelantionShips");

            migrationBuilder.DropForeignKey(
                name: "FK_RelantionShips_Users_FirstUserId",
                table: "RelantionShips");

            migrationBuilder.DropForeignKey(
                name: "FK_RelantionShips_Users_SecondUserId",
                table: "RelantionShips");

            migrationBuilder.DropTable(
                name: "Folder");

            migrationBuilder.DropIndex(
                name: "IX_RelantionShips_ActionUserId",
                table: "RelantionShips");

            migrationBuilder.DropIndex(
                name: "IX_RelantionShips_SecondUserId",
                table: "RelantionShips");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Label");

            migrationBuilder.AddForeignKey(
                name: "FK_RelantionShips_Users_FirstUserId",
                table: "RelantionShips",
                column: "FirstUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
