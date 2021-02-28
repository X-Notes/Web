using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class ketsts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("5c5c2c77-c5d2-4e60-9257-56a6c9277213"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("7b3aa0dd-08a2-4be0-bafb-f01819cf9512"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("90a38991-7e73-45ab-85f0-67fdd3cad991"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("c6bca371-0446-420f-8042-cc47d997553a"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("065d9de8-4546-4a71-b3f8-f30a33c32df0"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("ee9542f0-e5b0-4165-a9b2-6d8ed3239968"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("1f470778-896d-4e97-9f37-1584357b3fab"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("76d13f52-307a-42df-8737-b33d773158d5"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("c1a0ab70-12bc-46e5-8819-1623568fb2c4"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("0bf96139-7984-4f06-92be-42803c409e64"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("5b61deff-52ad-4b6d-9f48-1e17b3e70c26"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("7c3d285a-2774-4957-befb-438f9e42d706"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("d52f4ca6-97c3-4680-918f-37ac6eb97075"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("2f147e10-d7d0-4472-89e6-f485e24d9ac0"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("57cfc6ea-e4ee-4d08-8b30-8deba8af1421"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("5461ed5f-c5be-454a-8521-735532c66580"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("6227ffaa-e9f6-4c0e-a068-43d1e73616ee"));

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

        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("5c5c2c77-c5d2-4e60-9257-56a6c9277213"), "Private" },
                    { new Guid("90a38991-7e73-45ab-85f0-67fdd3cad991"), "Shared" },
                    { new Guid("c6bca371-0446-420f-8042-cc47d997553a"), "Deleted" },
                    { new Guid("7b3aa0dd-08a2-4be0-bafb-f01819cf9512"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("065d9de8-4546-4a71-b3f8-f30a33c32df0"), "Medium" },
                    { new Guid("ee9542f0-e5b0-4165-a9b2-6d8ed3239968"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("76d13f52-307a-42df-8737-b33d773158d5"), "Russian" },
                    { new Guid("c1a0ab70-12bc-46e5-8819-1623568fb2c4"), "English" },
                    { new Guid("1f470778-896d-4e97-9f37-1584357b3fab"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("d52f4ca6-97c3-4680-918f-37ac6eb97075"), "Private" },
                    { new Guid("5b61deff-52ad-4b6d-9f48-1e17b3e70c26"), "Shared" },
                    { new Guid("7c3d285a-2774-4957-befb-438f9e42d706"), "Deleted" },
                    { new Guid("0bf96139-7984-4f06-92be-42803c409e64"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("2f147e10-d7d0-4472-89e6-f485e24d9ac0"), "Viewer" },
                    { new Guid("57cfc6ea-e4ee-4d08-8b30-8deba8af1421"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("5461ed5f-c5be-454a-8521-735532c66580"), "Light" },
                    { new Guid("6227ffaa-e9f6-4c0e-a068-43d1e73616ee"), "Dark" }
                });
        }
    }
}
