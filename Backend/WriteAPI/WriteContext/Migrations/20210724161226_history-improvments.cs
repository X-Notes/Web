using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.History;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class historyimprovments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents");

            migrationBuilder.DropForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteHistories_NoteHistoryId",
                table: "UserNoteHistoryManyToMany");

            migrationBuilder.DropTable(
                name: "NoteHistories");

            migrationBuilder.DropColumn(
                name: "IsHistory",
                table: "Notes");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Notes",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Labels",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Folders",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<Guid>(
                name: "NoteId",
                table: "BaseNoteContents",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "NoteSnapshotId",
                table: "BaseNoteContents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NoteSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteTypeId = table.Column<int>(type: "integer", nullable: false),
                    RefTypeId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Labels = table.Column<List<HistoryLabel>>(type: "jsonb", nullable: true),
                    SnapshotTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoteSnapshots_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoteSnapshots_NotesTypes_NoteTypeId",
                        column: x => x.NoteTypeId,
                        principalTable: "NotesTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoteSnapshots_RefTypes_RefTypeId",
                        column: x => x.RefTypeId,
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NoteSnapshotId",
                table: "BaseNoteContents",
                column: "NoteSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteSnapshots_NoteId",
                table: "NoteSnapshots",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteSnapshots_NoteTypeId",
                table: "NoteSnapshots",
                column: "NoteTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteSnapshots_RefTypeId",
                table: "NoteSnapshots",
                column: "RefTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_NoteSnapshots_NoteSnapshotId",
                table: "BaseNoteContents",
                column: "NoteSnapshotId",
                principalTable: "NoteSnapshots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteSnapshots_NoteHistoryId",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId",
                principalTable: "NoteSnapshots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_NoteSnapshots_NoteSnapshotId",
                table: "BaseNoteContents");

            migrationBuilder.DropForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteSnapshots_NoteHistoryId",
                table: "UserNoteHistoryManyToMany");

            migrationBuilder.DropTable(
                name: "NoteSnapshots");

            migrationBuilder.DropIndex(
                name: "IX_BaseNoteContents_NoteSnapshotId",
                table: "BaseNoteContents");

            migrationBuilder.DropColumn(
                name: "NoteSnapshotId",
                table: "BaseNoteContents");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Notes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsHistory",
                table: "Notes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Labels",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "Folders",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "NoteId",
                table: "BaseNoteContents",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "NoteHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SnapshotTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoteHistories_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NoteHistories_NoteId",
                table: "NoteHistories",
                column: "NoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_Notes_NoteId",
                table: "BaseNoteContents",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserNoteHistoryManyToMany_NoteHistories_NoteHistoryId",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId",
                principalTable: "NoteHistories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
