using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class notifiocationsupdating : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Message",
                schema: "user",
                table: "Notification",
                newName: "TranslateKeyMessage");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalMessage",
                schema: "user",
                table: "Notification",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalMessage",
                schema: "user",
                table: "Notification");

            migrationBuilder.RenameColumn(
                name: "TranslateKeyMessage",
                schema: "user",
                table: "Notification",
                newName: "Message");
        }
    }
}
