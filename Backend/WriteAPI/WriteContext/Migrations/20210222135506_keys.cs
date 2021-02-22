using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class keys : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserOnPrivateNotes_RefTypes_AccessTypeId",
                table: "UserOnPrivateNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_UsersOnPrivateFolders_RefTypes_AccessTypeId",
                table: "UsersOnPrivateFolders");

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("5a5763ce-7801-4127-84cb-7bc89e6f65b5"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("8d2f2643-7418-4fed-9a9a-aa8b41aa590f"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("e55dc9f9-4ccf-4ba5-b19d-b61c27268f43"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("e9d2286d-c33b-4f46-9fa5-e5f53a6ac440"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("58cd5687-c6f9-45a9-a990-09c82a90839a"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("63d72c7f-d7c8-474c-9cc3-476d7b8b168e"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("32cff38a-51ce-4e5d-b741-b9bb7f2f7de7"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("54fb0476-8938-406d-97d9-979d86991671"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("c674aa3d-46bc-47e3-a62b-f4744d8312b4"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("2d6c43e1-5579-4210-a715-d011dd019336"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("676f3ad9-11fd-4bb0-be8b-944911987495"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("cfb54e18-b917-46ab-9f35-39d8f41768bf"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("fae8d22e-b2fa-41c7-9f8c-0cd71a13d62e"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("280c8737-01bf-4a0a-856f-8b5e4a3e4ecc"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("d534d569-57f6-428d-b378-919650804a99"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("28cf719f-32e9-4502-bf11-283872608bf1"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("badfb373-1db2-44c6-8e34-daa76f4a28c6"));

            migrationBuilder.AlterColumn<Guid>(
                name: "AccessTypeId",
                table: "UsersOnPrivateFolders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "AccessTypeId",
                table: "UserOnPrivateNotes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_UserOnPrivateNotes_RefTypes_AccessTypeId",
                table: "UserOnPrivateNotes",
                column: "AccessTypeId",
                principalTable: "RefTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UsersOnPrivateFolders_RefTypes_AccessTypeId",
                table: "UsersOnPrivateFolders",
                column: "AccessTypeId",
                principalTable: "RefTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserOnPrivateNotes_RefTypes_AccessTypeId",
                table: "UserOnPrivateNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_UsersOnPrivateFolders_RefTypes_AccessTypeId",
                table: "UsersOnPrivateFolders");

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

            migrationBuilder.AlterColumn<Guid>(
                name: "AccessTypeId",
                table: "UsersOnPrivateFolders",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "AccessTypeId",
                table: "UserOnPrivateNotes",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("8d2f2643-7418-4fed-9a9a-aa8b41aa590f"), "Private" },
                    { new Guid("5a5763ce-7801-4127-84cb-7bc89e6f65b5"), "Shared" },
                    { new Guid("e55dc9f9-4ccf-4ba5-b19d-b61c27268f43"), "Deleted" },
                    { new Guid("e9d2286d-c33b-4f46-9fa5-e5f53a6ac440"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("63d72c7f-d7c8-474c-9cc3-476d7b8b168e"), "Medium" },
                    { new Guid("58cd5687-c6f9-45a9-a990-09c82a90839a"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("c674aa3d-46bc-47e3-a62b-f4744d8312b4"), "Russian" },
                    { new Guid("54fb0476-8938-406d-97d9-979d86991671"), "English" },
                    { new Guid("32cff38a-51ce-4e5d-b741-b9bb7f2f7de7"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("2d6c43e1-5579-4210-a715-d011dd019336"), "Private" },
                    { new Guid("fae8d22e-b2fa-41c7-9f8c-0cd71a13d62e"), "Shared" },
                    { new Guid("676f3ad9-11fd-4bb0-be8b-944911987495"), "Deleted" },
                    { new Guid("cfb54e18-b917-46ab-9f35-39d8f41768bf"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("d534d569-57f6-428d-b378-919650804a99"), "Viewer" },
                    { new Guid("280c8737-01bf-4a0a-856f-8b5e4a3e4ecc"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("28cf719f-32e9-4502-bf11-283872608bf1"), "Light" },
                    { new Guid("badfb373-1db2-44c6-8e34-daa76f4a28c6"), "Dark" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_UserOnPrivateNotes_RefTypes_AccessTypeId",
                table: "UserOnPrivateNotes",
                column: "AccessTypeId",
                principalTable: "RefTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UsersOnPrivateFolders_RefTypes_AccessTypeId",
                table: "UsersOnPrivateFolders",
                column: "AccessTypeId",
                principalTable: "RefTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
