using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class initnotetext : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("0b813fd4-4e1d-48c8-97ee-4875c8bfd056"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("4ade58f9-64e4-4c68-9e43-2778f9f1815f"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("6a362d92-28fd-4f02-b47a-1502df9ec64d"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("be4aa4bb-97de-47e0-957c-8b30deaea73b"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("58c465c0-e78d-4fb0-b8c5-12ccfb9d69c3"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("94cc6d43-4aab-4050-967d-051583b24745"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("5101c9e4-4b08-4ccb-8c61-8f31496590ad"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("75d66824-91f0-4a0a-9372-648ca402310b"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("d1813aff-3393-4142-8670-13452ed60fb1"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("205d68fc-fdab-43d2-95f4-dc5a2c0bd4dd"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("73c4cdb2-97bc-4931-b34f-6f7f6e19b65c"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("9fa34f9d-30df-4d0f-a84b-813d276d9392"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("b5d38ff1-3ef5-406e-98b7-ab8ae523cbf4"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("42ede8f3-3b1b-4d57-855f-a9b38bb91099"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("c749d737-3118-4ebd-aa7e-3b0066cd7cfa"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("b6eafed3-ff91-4502-b8ac-15e128644f67"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("cb5b4564-6f14-4343-8a8a-d0f97fe6be00"));

            migrationBuilder.CreateTable(
                name: "BaseNoteContents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Discriminator = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaseNoteContents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaseNoteContents_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("7c11f220-8f8d-42d3-b40f-3271a88d3828"), "Private" },
                    { new Guid("888a0eaa-2a0d-4100-902b-2e0e8c03978a"), "Shared" },
                    { new Guid("aa8f432d-26ac-475d-9b77-24e94ae6e3b1"), "Deleted" },
                    { new Guid("feeb658b-a54f-4af7-ae84-dd17550295fa"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("935b9071-729b-4516-b6a1-cd34c95ada51"), "Medium" },
                    { new Guid("9dbfe312-d3ee-4b7a-bd84-2553e739c0aa"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("6c2f0824-847f-4133-8b57-ccb688f2b54e"), "Russian" },
                    { new Guid("8e7ce172-8c49-42ee-9fe2-7d29bc274cfa"), "English" },
                    { new Guid("4edfaf05-bd8b-4618-a2eb-a781a27ad22e"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("b6bca8bb-e6c7-4a6a-a3a2-2fdeba400224"), "Private" },
                    { new Guid("4dff2073-9f09-4026-bd76-532a994815ca"), "Shared" },
                    { new Guid("a1c2ea15-b53b-49b5-af47-c175dd29d7ae"), "Deleted" },
                    { new Guid("db620ff8-44b7-44cb-b4af-f094e1d2d117"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("47377f4c-3099-407d-a0f2-75ad077b55c4"), "Viewer" },
                    { new Guid("063c5d0e-b4d5-4973-bf1f-dec7d3ef13c4"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("e9c5dd77-c8a2-4179-9189-dbc9687d6d47"), "Light" },
                    { new Guid("674af535-fb0a-4509-9dcb-6abd1fe906d1"), "Dark" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NoteId",
                table: "BaseNoteContents",
                column: "NoteId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BaseNoteContents");

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("7c11f220-8f8d-42d3-b40f-3271a88d3828"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("888a0eaa-2a0d-4100-902b-2e0e8c03978a"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("aa8f432d-26ac-475d-9b77-24e94ae6e3b1"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("feeb658b-a54f-4af7-ae84-dd17550295fa"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("935b9071-729b-4516-b6a1-cd34c95ada51"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("9dbfe312-d3ee-4b7a-bd84-2553e739c0aa"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("4edfaf05-bd8b-4618-a2eb-a781a27ad22e"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("6c2f0824-847f-4133-8b57-ccb688f2b54e"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("8e7ce172-8c49-42ee-9fe2-7d29bc274cfa"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("4dff2073-9f09-4026-bd76-532a994815ca"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("a1c2ea15-b53b-49b5-af47-c175dd29d7ae"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("b6bca8bb-e6c7-4a6a-a3a2-2fdeba400224"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("db620ff8-44b7-44cb-b4af-f094e1d2d117"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("063c5d0e-b4d5-4973-bf1f-dec7d3ef13c4"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("47377f4c-3099-407d-a0f2-75ad077b55c4"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("674af535-fb0a-4509-9dcb-6abd1fe906d1"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("e9c5dd77-c8a2-4179-9189-dbc9687d6d47"));

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("0b813fd4-4e1d-48c8-97ee-4875c8bfd056"), "Private" },
                    { new Guid("be4aa4bb-97de-47e0-957c-8b30deaea73b"), "Shared" },
                    { new Guid("6a362d92-28fd-4f02-b47a-1502df9ec64d"), "Deleted" },
                    { new Guid("4ade58f9-64e4-4c68-9e43-2778f9f1815f"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("94cc6d43-4aab-4050-967d-051583b24745"), "Medium" },
                    { new Guid("58c465c0-e78d-4fb0-b8c5-12ccfb9d69c3"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("d1813aff-3393-4142-8670-13452ed60fb1"), "Russian" },
                    { new Guid("5101c9e4-4b08-4ccb-8c61-8f31496590ad"), "English" },
                    { new Guid("75d66824-91f0-4a0a-9372-648ca402310b"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("9fa34f9d-30df-4d0f-a84b-813d276d9392"), "Private" },
                    { new Guid("73c4cdb2-97bc-4931-b34f-6f7f6e19b65c"), "Shared" },
                    { new Guid("b5d38ff1-3ef5-406e-98b7-ab8ae523cbf4"), "Deleted" },
                    { new Guid("205d68fc-fdab-43d2-95f4-dc5a2c0bd4dd"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("c749d737-3118-4ebd-aa7e-3b0066cd7cfa"), "Viewer" },
                    { new Guid("42ede8f3-3b1b-4d57-855f-a9b38bb91099"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("b6eafed3-ff91-4502-b8ac-15e128644f67"), "Light" },
                    { new Guid("cb5b4564-6f14-4343-8a8a-d0f97fe6be00"), "Dark" }
                });
        }
    }
}
