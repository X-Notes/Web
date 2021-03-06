using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class linkedList : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("9af0fde5-e710-453e-93de-48a5943b4315"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("a80c6e40-0326-4466-b200-173eed7de458"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("decf8345-8287-4a6d-bc40-189418b2665e"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("e4a902e9-428c-4e85-a501-e76f505d02ad"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("86782d1f-ffc3-4b4b-bcb1-f9a473273004"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("ff4b6aef-2113-4a07-bd40-42c6b8dae518"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("4dd4d3f4-ff8f-4b62-9267-a0f1bd7816fc"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("d36886ae-c9bf-4c56-b147-273e9f63fe26"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("e607a029-53ec-4213-aa3e-74336eaab35d"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("15ae25ad-2872-4942-8761-3ff33cad47dd"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("2cb46ba3-88e3-4933-a46f-d0b121fa9dfd"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("59fab245-5381-4f21-abe8-94a3fcbf91a9"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("76c7849d-9407-48fa-ac26-449b4879222c"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("a54c3821-2e20-497d-ae6c-0b65df49d48a"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("b2a544a3-c6e1-4340-8644-bc848c88742f"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("35019d7b-dedd-4901-9257-534f1e5edf84"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("61618455-6fe5-4206-b520-fdf2810ca723"));

            migrationBuilder.DropColumn(
                name: "Order",
                table: "BaseNoteContents");

            migrationBuilder.AddColumn<Guid>(
                name: "NextId",
                table: "BaseNoteContents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NextId1",
                table: "BaseNoteContents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PrevId",
                table: "BaseNoteContents",
                type: "uuid",
                nullable: true);

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("381428f6-0568-4fb4-9c86-2d9e0f381308"), "Private" },
                    { new Guid("96c416cd-94d1-4f6c-9dd6-3b1f1e1e14e9"), "Shared" },
                    { new Guid("e3ea1cb2-5301-42fd-b283-2fe6133755c1"), "Deleted" },
                    { new Guid("3e00dc8e-1030-4022-bc73-9d5c13b363d3"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("5c335a93-7aa7-40ff-b995-6c90f2536e98"), "Medium" },
                    { new Guid("656e1f08-bb0e-406c-a0b9-77dc3e10a86b"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("01a4f567-b5cd-4d98-8d55-b49df9415d99"), "Russian" },
                    { new Guid("6579263d-c4db-446a-8223-7d895dc45f1b"), "English" },
                    { new Guid("38b402a0-e1b1-42d7-b472-db788a1a3924"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("d01e34ef-3bc0-4fd4-b4cf-0996101e9d87"), "Private" },
                    { new Guid("ad503d43-c28e-405a-aa20-bcb4e2b1a2a5"), "Shared" },
                    { new Guid("1f384f3c-1aa8-4664-ac8d-e264e68164dc"), "Deleted" },
                    { new Guid("556a3f0d-1edd-4ccc-bd7e-b087b033849a"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("7c247026-36c6-4c17-b227-afb37e8ec7cd"), "Viewer" },
                    { new Guid("397821bf-74d5-4bdf-81e4-0698d5a92476"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("5b08dced-b041-4a77-b290-f08e36af1d70"), "Light" },
                    { new Guid("f52a188b-5422-4144-91f6-bde40b82ce22"), "Dark" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NextId",
                table: "BaseNoteContents",
                column: "NextId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NextId1",
                table: "BaseNoteContents",
                column: "NextId1");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_NextId",
                table: "BaseNoteContents",
                column: "NextId",
                principalTable: "BaseNoteContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_NextId1",
                table: "BaseNoteContents",
                column: "NextId1",
                principalTable: "BaseNoteContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_NextId",
                table: "BaseNoteContents");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseNoteContents_BaseNoteContents_NextId1",
                table: "BaseNoteContents");

            migrationBuilder.DropIndex(
                name: "IX_BaseNoteContents_NextId",
                table: "BaseNoteContents");

            migrationBuilder.DropIndex(
                name: "IX_BaseNoteContents_NextId1",
                table: "BaseNoteContents");

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("381428f6-0568-4fb4-9c86-2d9e0f381308"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("3e00dc8e-1030-4022-bc73-9d5c13b363d3"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("96c416cd-94d1-4f6c-9dd6-3b1f1e1e14e9"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("e3ea1cb2-5301-42fd-b283-2fe6133755c1"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("5c335a93-7aa7-40ff-b995-6c90f2536e98"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("656e1f08-bb0e-406c-a0b9-77dc3e10a86b"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("01a4f567-b5cd-4d98-8d55-b49df9415d99"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("38b402a0-e1b1-42d7-b472-db788a1a3924"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("6579263d-c4db-446a-8223-7d895dc45f1b"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("1f384f3c-1aa8-4664-ac8d-e264e68164dc"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("556a3f0d-1edd-4ccc-bd7e-b087b033849a"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("ad503d43-c28e-405a-aa20-bcb4e2b1a2a5"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("d01e34ef-3bc0-4fd4-b4cf-0996101e9d87"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("397821bf-74d5-4bdf-81e4-0698d5a92476"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("7c247026-36c6-4c17-b227-afb37e8ec7cd"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("5b08dced-b041-4a77-b290-f08e36af1d70"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("f52a188b-5422-4144-91f6-bde40b82ce22"));

            migrationBuilder.DropColumn(
                name: "NextId",
                table: "BaseNoteContents");

            migrationBuilder.DropColumn(
                name: "NextId1",
                table: "BaseNoteContents");

            migrationBuilder.DropColumn(
                name: "PrevId",
                table: "BaseNoteContents");

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "BaseNoteContents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("a80c6e40-0326-4466-b200-173eed7de458"), "Private" },
                    { new Guid("decf8345-8287-4a6d-bc40-189418b2665e"), "Shared" },
                    { new Guid("e4a902e9-428c-4e85-a501-e76f505d02ad"), "Deleted" },
                    { new Guid("9af0fde5-e710-453e-93de-48a5943b4315"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("86782d1f-ffc3-4b4b-bcb1-f9a473273004"), "Medium" },
                    { new Guid("ff4b6aef-2113-4a07-bd40-42c6b8dae518"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("d36886ae-c9bf-4c56-b147-273e9f63fe26"), "Russian" },
                    { new Guid("e607a029-53ec-4213-aa3e-74336eaab35d"), "English" },
                    { new Guid("4dd4d3f4-ff8f-4b62-9267-a0f1bd7816fc"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("2cb46ba3-88e3-4933-a46f-d0b121fa9dfd"), "Private" },
                    { new Guid("59fab245-5381-4f21-abe8-94a3fcbf91a9"), "Shared" },
                    { new Guid("15ae25ad-2872-4942-8761-3ff33cad47dd"), "Deleted" },
                    { new Guid("76c7849d-9407-48fa-ac26-449b4879222c"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("a54c3821-2e20-497d-ae6c-0b65df49d48a"), "Viewer" },
                    { new Guid("b2a544a3-c6e1-4340-8644-bc848c88742f"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("61618455-6fe5-4206-b520-fdf2810ca723"), "Light" },
                    { new Guid("35019d7b-dedd-4901-9257-534f1e5edf84"), "Dark" }
                });
        }
    }
}
