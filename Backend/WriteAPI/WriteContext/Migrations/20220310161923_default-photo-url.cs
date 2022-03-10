using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class defaultphotourl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PersonalKey",
                schema: "user",
                table: "User",
                newName: "DefaultPhotoUrl");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DefaultPhotoUrl",
                schema: "user",
                table: "User",
                newName: "PersonalKey");
        }
    }
}
