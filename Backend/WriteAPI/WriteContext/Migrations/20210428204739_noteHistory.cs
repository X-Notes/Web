using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class noteHistory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Users_UserFromId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Users_UserToId",
                table: "Notification");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notification",
                table: "Notification");

            migrationBuilder.RenameTable(
                name: "Notification",
                newName: "Notifications");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_UserToId",
                table: "Notifications",
                newName: "IX_Notifications_UserToId");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_UserFromId",
                table: "Notifications",
                newName: "IX_Notifications_UserFromId");

            migrationBuilder.AddColumn<bool>(
                name: "IsHistory",
                table: "Notes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "NoteHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    SnapshotTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoteHistory_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserNoteHistoryManyToMany",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteHistoryId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNoteHistoryManyToMany", x => new { x.UserId, x.NoteHistoryId });
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_NoteHistory_NoteHistoryId",
                        column: x => x.NoteHistoryId,
                        principalTable: "NoteHistory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NoteHistory_NoteId",
                table: "NoteHistory",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNoteHistoryManyToMany_NoteHistoryId",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserFromId",
                table: "Notifications",
                column: "UserFromId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserToId",
                table: "Notifications",
                column: "UserToId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserFromId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserToId",
                table: "Notifications");

            migrationBuilder.DropTable(
                name: "UserNoteHistoryManyToMany");

            migrationBuilder.DropTable(
                name: "NoteHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "IsHistory",
                table: "Notes");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notification");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserToId",
                table: "Notification",
                newName: "IX_Notification_UserToId");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserFromId",
                table: "Notification",
                newName: "IX_Notification_UserFromId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notification",
                table: "Notification",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Users_UserFromId",
                table: "Notification",
                column: "UserFromId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Users_UserToId",
                table: "Notification",
                column: "UserToId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
