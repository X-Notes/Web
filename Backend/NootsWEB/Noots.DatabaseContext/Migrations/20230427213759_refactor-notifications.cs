using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noots.DatabaseContext.Migrations
{
    public partial class refactornotifications : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationSetting",
                schema: "user");

            migrationBuilder.DropColumn(
                name: "TranslateKeyMessage",
                schema: "user",
                table: "Notification");

            migrationBuilder.AlterColumn<int>(
                name: "BillingPlanId",
                schema: "user",
                table: "User",
                type: "integer",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                schema: "user",
                table: "Notification",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NotificationMessagesId",
                schema: "user",
                table: "Notification",
                type: "integer",
                nullable: false,
                defaultValue: 4);

            migrationBuilder.CreateTable(
                name: "NotificationMessages",
                schema: "user",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    MessageKey = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationMessages", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "user",
                table: "NotificationMessages",
                columns: new[] { "Id", "MessageKey" },
                values: new object[,]
                {
                    { 1, "notification.changeUserPermissionFolder" },
                    { 2, "notification.changeUserPermissionNote" },
                    { 3, "notification.sentInvitesToFolder" },
                    { 4, "notification.sentInvitesToNote" },
                    { 5, "notification.removeUserFromFolder" },
                    { 6, "notification.removeUserFromNote" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notification_NotificationMessagesId",
                schema: "user",
                table: "Notification",
                column: "NotificationMessagesId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_NotificationMessages_NotificationMessagesId",
                schema: "user",
                table: "Notification",
                column: "NotificationMessagesId",
                principalSchema: "user",
                principalTable: "NotificationMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_NotificationMessages_NotificationMessagesId",
                schema: "user",
                table: "Notification");

            migrationBuilder.DropTable(
                name: "NotificationMessages",
                schema: "user");

            migrationBuilder.DropIndex(
                name: "IX_Notification_NotificationMessagesId",
                schema: "user",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "Metadata",
                schema: "user",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "NotificationMessagesId",
                schema: "user",
                table: "Notification");

            migrationBuilder.AlterColumn<int>(
                name: "BillingPlanId",
                schema: "user",
                table: "User",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "TranslateKeyMessage",
                schema: "user",
                table: "Notification",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NotificationSetting",
                schema: "user",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationSetting", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationSetting_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "user",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSetting_UserId",
                schema: "user",
                table: "NotificationSetting",
                column: "UserId",
                unique: true);
        }
    }
}
