using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class textcontent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlbumNoteAppFile_Files_FilesId",
                table: "AlbumNoteAppFile");

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

            migrationBuilder.RenameColumn(
                name: "FilesId",
                table: "AlbumNoteAppFile",
                newName: "PhotosId");

            migrationBuilder.RenameIndex(
                name: "IX_AlbumNoteAppFile_FilesId",
                table: "AlbumNoteAppFile",
                newName: "IX_AlbumNoteAppFile_PhotosId");

            migrationBuilder.AddColumn<bool>(
                name: "Checked",
                table: "TextNote",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "HeadingType",
                table: "TextNote",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextType",
                table: "TextNote",
                type: "text",
                nullable: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFile_Files_PhotosId",
                table: "AlbumNoteAppFile",
                column: "PhotosId",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlbumNoteAppFile_Files_PhotosId",
                table: "AlbumNoteAppFile");

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

            migrationBuilder.DropColumn(
                name: "Checked",
                table: "TextNote");

            migrationBuilder.DropColumn(
                name: "HeadingType",
                table: "TextNote");

            migrationBuilder.DropColumn(
                name: "TextType",
                table: "TextNote");

            migrationBuilder.RenameColumn(
                name: "PhotosId",
                table: "AlbumNoteAppFile",
                newName: "FilesId");

            migrationBuilder.RenameIndex(
                name: "IX_AlbumNoteAppFile_PhotosId",
                table: "AlbumNoteAppFile",
                newName: "IX_AlbumNoteAppFile_FilesId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFile_Files_FilesId",
                table: "AlbumNoteAppFile",
                column: "FilesId",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
