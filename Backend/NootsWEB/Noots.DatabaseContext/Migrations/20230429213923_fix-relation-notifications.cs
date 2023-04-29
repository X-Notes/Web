using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class fixrelationnotifications : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notification_NotificationMessagesId",
                schema: "user",
                table: "Notification");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_NotificationMessagesId",
                schema: "user",
                table: "Notification",
                column: "NotificationMessagesId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notification_NotificationMessagesId",
                schema: "user",
                table: "Notification");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_NotificationMessagesId",
                schema: "user",
                table: "Notification",
                column: "NotificationMessagesId",
                unique: true);
        }
    }
}
