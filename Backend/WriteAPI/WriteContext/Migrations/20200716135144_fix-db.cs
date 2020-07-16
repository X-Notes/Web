using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace WriteContext.Migrations
{
    public partial class fixdb : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserOnNote",
                table: "UserOnNote");

            migrationBuilder.DropIndex(
                name: "IX_UserOnNote_UserId",
                table: "UserOnNote");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "UserOnNote");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserOnNote",
                table: "UserOnNote",
                columns: new[] { "UserId", "NoteId" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserOnNote",
                table: "UserOnNote");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "UserOnNote",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserOnNote",
                table: "UserOnNote",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnNote_UserId",
                table: "UserOnNote",
                column: "UserId");
        }
    }
}
