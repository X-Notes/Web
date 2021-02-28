using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class order : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("02e98546-2dde-48b5-a2ba-836a88f8d904"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("1a2cc898-1985-4ae3-897b-3696e82a2a13"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("4009e211-ce56-4214-958d-bb988261b1b3"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("9aadc267-cfcd-4285-8eba-9eda887d8377"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("1dcfc61c-4897-4b53-80cb-611458d39a3f"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("95f25804-364d-472c-b76a-b02645cff3cd"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("01190bb5-081f-48f4-8125-6eba299e3f24"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("12fe31ab-24bc-4ef2-a4e7-f0825a1b8f13"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("66c4d3b0-07c9-4b87-9d63-faa4056d3b53"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("693bc6d9-7175-489f-ab00-3775a070de97"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("8eb2f562-0a02-4106-af3a-d27ebb40ebea"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("bcf6021e-b754-43b2-9549-d083d481983b"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("cc4bc1d8-f9ad-48cd-afe1-9f63d8fdb805"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("0663602f-c134-41e2-95e2-fe28b2745cff"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("ccfe7784-7684-4abf-846b-9e7f5d9c6519"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("1fc912ea-3d4c-4f2b-8898-83cae1b08ece"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("c0405e19-3798-4810-a562-c3f2abd6896e"));

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
                    { new Guid("3de45038-e3ee-4f55-81eb-756c4a268c30"), "Private" },
                    { new Guid("18642927-0508-4841-ac32-37e01a9013a1"), "Shared" },
                    { new Guid("1fb2fe34-3cf0-47fb-9651-afe3396dca42"), "Deleted" },
                    { new Guid("df8e4a31-c6b8-4329-8ab0-0bc5b2169486"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("1f2e9c39-30ae-483c-95a5-bd114bcf6cfe"), "Medium" },
                    { new Guid("254f6c02-0655-4ae0-9e22-ed4437549ac8"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("7cf122d4-4ab5-41f4-b43c-ab8a5a67ca3d"), "Russian" },
                    { new Guid("a9650f0f-272c-45d4-8ae4-2ee20999ca74"), "English" },
                    { new Guid("3108b3d9-073b-4db2-a0e3-066674b25b4c"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("631c5b68-9253-4168-a926-ffa75caed66a"), "Private" },
                    { new Guid("dadcb143-3742-4b26-ac88-b2cdf606464a"), "Shared" },
                    { new Guid("69eaeea3-d4e5-4a91-a895-630792fedff5"), "Deleted" },
                    { new Guid("88c54323-f758-4f90-91f5-cda02b23d73c"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("6faafe15-df29-4dd5-9dae-8a9f1842519a"), "Viewer" },
                    { new Guid("414bd645-71c2-411e-b0ce-32661d4b2576"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("301518d9-2e4c-4805-bc0a-7e10b7c59e63"), "Light" },
                    { new Guid("e40f23da-7f5c-437b-8d23-2f9517d315c9"), "Dark" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("18642927-0508-4841-ac32-37e01a9013a1"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("1fb2fe34-3cf0-47fb-9651-afe3396dca42"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("3de45038-e3ee-4f55-81eb-756c4a268c30"));

            migrationBuilder.DeleteData(
                table: "FoldersTypes",
                keyColumn: "Id",
                keyValue: new Guid("df8e4a31-c6b8-4329-8ab0-0bc5b2169486"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("1f2e9c39-30ae-483c-95a5-bd114bcf6cfe"));

            migrationBuilder.DeleteData(
                table: "FontSizes",
                keyColumn: "Id",
                keyValue: new Guid("254f6c02-0655-4ae0-9e22-ed4437549ac8"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("3108b3d9-073b-4db2-a0e3-066674b25b4c"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("7cf122d4-4ab5-41f4-b43c-ab8a5a67ca3d"));

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: new Guid("a9650f0f-272c-45d4-8ae4-2ee20999ca74"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("631c5b68-9253-4168-a926-ffa75caed66a"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("69eaeea3-d4e5-4a91-a895-630792fedff5"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("88c54323-f758-4f90-91f5-cda02b23d73c"));

            migrationBuilder.DeleteData(
                table: "NotesTypes",
                keyColumn: "Id",
                keyValue: new Guid("dadcb143-3742-4b26-ac88-b2cdf606464a"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("414bd645-71c2-411e-b0ce-32661d4b2576"));

            migrationBuilder.DeleteData(
                table: "RefTypes",
                keyColumn: "Id",
                keyValue: new Guid("6faafe15-df29-4dd5-9dae-8a9f1842519a"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("301518d9-2e4c-4805-bc0a-7e10b7c59e63"));

            migrationBuilder.DeleteData(
                table: "Themes",
                keyColumn: "Id",
                keyValue: new Guid("e40f23da-7f5c-437b-8d23-2f9517d315c9"));

            migrationBuilder.DropColumn(
                name: "Order",
                table: "BaseNoteContents");

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("9aadc267-cfcd-4285-8eba-9eda887d8377"), "Private" },
                    { new Guid("4009e211-ce56-4214-958d-bb988261b1b3"), "Shared" },
                    { new Guid("1a2cc898-1985-4ae3-897b-3696e82a2a13"), "Deleted" },
                    { new Guid("02e98546-2dde-48b5-a2ba-836a88f8d904"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("1dcfc61c-4897-4b53-80cb-611458d39a3f"), "Medium" },
                    { new Guid("95f25804-364d-472c-b76a-b02645cff3cd"), "Big" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("66c4d3b0-07c9-4b87-9d63-faa4056d3b53"), "Russian" },
                    { new Guid("01190bb5-081f-48f4-8125-6eba299e3f24"), "English" },
                    { new Guid("12fe31ab-24bc-4ef2-a4e7-f0825a1b8f13"), "Ukraine" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("cc4bc1d8-f9ad-48cd-afe1-9f63d8fdb805"), "Private" },
                    { new Guid("bcf6021e-b754-43b2-9549-d083d481983b"), "Shared" },
                    { new Guid("8eb2f562-0a02-4106-af3a-d27ebb40ebea"), "Deleted" },
                    { new Guid("693bc6d9-7175-489f-ab00-3775a070de97"), "Archive" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("0663602f-c134-41e2-95e2-fe28b2745cff"), "Viewer" },
                    { new Guid("ccfe7784-7684-4abf-846b-9e7f5d9c6519"), "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("c0405e19-3798-4810-a562-c3f2abd6896e"), "Light" },
                    { new Guid("1fc912ea-3d4c-4f2b-8898-83cae1b08ece"), "Dark" }
                });
        }
    }
}
