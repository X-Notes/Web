using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class requiredFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("5b4fe8b3-4a1f-4175-95c3-5e072195b8c4"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("9116d2f9-c8bb-4afe-9cac-8320a308c297"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("af1f3a32-5660-4a34-b7e8-7cf628a68882"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("f636a31d-857b-4fcd-b9da-2c39c4b1f8e3"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("54d8fd39-6414-46e6-952e-03de741c2883"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("715bb5fb-16bd-4a7b-8863-2ea065155616"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("2d2888f9-4b0e-42df-9516-766d4354dbfd"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("315546f7-3953-42c0-90a8-84c76ee99e8a"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("c66a9316-4925-4259-83a7-1835791a84dd"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("3e0de576-3692-49d2-af93-586e4c4148e2"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("74a7752d-a6fa-43da-912d-f437b01b8e83"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("7f652c28-3d2c-452b-a8a2-a7cf1d0807a1"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("ee7badf8-b495-4c24-a6cd-cd7d34ee8451"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("1f38e085-0884-410a-94b7-4c1d484f6ef3"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("7a6b901d-950a-4f51-b966-8f3368f86d18"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("099d8668-1b68-44fb-9932-a6d0bd4f16c5"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("3592f840-6f2b-4d76-9d6a-5a5788a08d37"));

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TextType",
                table: "TextNote",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

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

        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "TextType",
                table: "TextNote",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("f636a31d-857b-4fcd-b9da-2c39c4b1f8e3"), "Private" },
                    { new Guid("af1f3a32-5660-4a34-b7e8-7cf628a68882"), "Shared" },
                    { new Guid("9116d2f9-c8bb-4afe-9cac-8320a308c297"), "Deleted" },
                    { new Guid("5b4fe8b3-4a1f-4175-95c3-5e072195b8c4"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("54d8fd39-6414-46e6-952e-03de741c2883"), "Medium" },
                    { new Guid("715bb5fb-16bd-4a7b-8863-2ea065155616"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("315546f7-3953-42c0-90a8-84c76ee99e8a"), "Russian" },
                    { new Guid("c66a9316-4925-4259-83a7-1835791a84dd"), "English" },
                    { new Guid("2d2888f9-4b0e-42df-9516-766d4354dbfd"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("74a7752d-a6fa-43da-912d-f437b01b8e83"), "Private" },
                    { new Guid("ee7badf8-b495-4c24-a6cd-cd7d34ee8451"), "Shared" },
                    { new Guid("7f652c28-3d2c-452b-a8a2-a7cf1d0807a1"), "Deleted" },
                    { new Guid("3e0de576-3692-49d2-af93-586e4c4148e2"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("7a6b901d-950a-4f51-b966-8f3368f86d18"), "Viewer" },
                    { new Guid("1f38e085-0884-410a-94b7-4c1d484f6ef3"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("099d8668-1b68-44fb-9932-a6d0bd4f16c5"), "Light" },
                    { new Guid("3592f840-6f2b-4d76-9d6a-5a5788a08d37"), "Dark" }
                });
        }
    }
}
