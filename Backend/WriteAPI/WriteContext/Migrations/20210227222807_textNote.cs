using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class textNote : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.DropColumn(
                name: "Content",
                table: "BaseNoteContents");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "BaseNoteContents");

            migrationBuilder.CreateTable(
                name: "TextNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TextNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("ccaff75e-fe6f-47e0-b547-3e8b969141fa"), "Private" },
                    { new Guid("c7710d34-c8eb-413f-beff-aeb1dcbc8a73"), "Shared" },
                    { new Guid("2dfe2a87-e4bf-4319-986d-4a3c0d1399e5"), "Deleted" },
                    { new Guid("1673d785-0889-4d55-b229-5faf64ebb929"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("ef4e27f9-747b-4e4b-ba25-d0624522603d"), "Medium" },
                    { new Guid("de999b8f-e870-4b9b-8b5a-5a5081ca2c04"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("2d01ecb1-96d7-4931-8475-a7e69afb5499"), "Russian" },
                    { new Guid("4e786ffd-667f-42a8-9e1b-c5630e85acc3"), "English" },
                    { new Guid("8d98916e-a463-4498-ad73-549ebbea9511"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("1d790efb-deb6-4615-9571-b864a1c0ed84"), "Private" },
                    { new Guid("705aecab-a976-4066-b777-58c9bf59676d"), "Shared" },
                    { new Guid("5018a4f8-c181-4367-ac61-8a0450b66600"), "Deleted" },
                    { new Guid("80d1b996-061e-4513-a0a0-2883160025f3"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("397af8ba-4829-4bdf-ab94-6a7ff95a93d4"), "Viewer" },
                    { new Guid("573c27a1-9b64-43c0-98c6-2a96d500fb82"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("16503b53-6232-4317-9efc-fbfcec47aa4e"), "Light" },
                    { new Guid("35ef76c7-800e-48f7-91ef-3cadddff09dc"), "Dark" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TextNote");

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("1673d785-0889-4d55-b229-5faf64ebb929"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("2dfe2a87-e4bf-4319-986d-4a3c0d1399e5"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("c7710d34-c8eb-413f-beff-aeb1dcbc8a73"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("ccaff75e-fe6f-47e0-b547-3e8b969141fa"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("de999b8f-e870-4b9b-8b5a-5a5081ca2c04"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("ef4e27f9-747b-4e4b-ba25-d0624522603d"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("2d01ecb1-96d7-4931-8475-a7e69afb5499"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("4e786ffd-667f-42a8-9e1b-c5630e85acc3"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("8d98916e-a463-4498-ad73-549ebbea9511"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("1d790efb-deb6-4615-9571-b864a1c0ed84"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("5018a4f8-c181-4367-ac61-8a0450b66600"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("705aecab-a976-4066-b777-58c9bf59676d"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("80d1b996-061e-4513-a0a0-2883160025f3"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("397af8ba-4829-4bdf-ab94-6a7ff95a93d4"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("573c27a1-9b64-43c0-98c6-2a96d500fb82"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("16503b53-6232-4317-9efc-fbfcec47aa4e"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("35ef76c7-800e-48f7-91ef-3cadddff09dc"));

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "BaseNoteContents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "BaseNoteContents",
                type: "text",
                nullable: false,
                defaultValue: "");

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
        }
    }
}
