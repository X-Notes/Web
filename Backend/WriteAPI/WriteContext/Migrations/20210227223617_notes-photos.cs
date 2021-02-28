using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class notesphotos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "AlbumNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlbumNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlbumNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlbumNoteAppFile",
                columns: table => new
                {
                    AlbumNotesId = table.Column<Guid>(type: "uuid", nullable: false),
                    FilesId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlbumNoteAppFile", x => new { x.AlbumNotesId, x.FilesId });
                    table.ForeignKey(
                        name: "FK_AlbumNoteAppFile_AlbumNote_AlbumNotesId",
                        column: x => x.AlbumNotesId,
                        principalTable: "AlbumNote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlbumNoteAppFile_Files_FilesId",
                        column: x => x.FilesId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_Backgrounds_FileId",
                table: "Backgrounds",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumNoteAppFile_FilesId",
                table: "AlbumNoteAppFile",
                column: "FilesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Backgrounds_Files_FileId",
                table: "Backgrounds",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Backgrounds_Files_FileId",
                table: "Backgrounds");

            migrationBuilder.DropTable(
                name: "AlbumNoteAppFile");

            migrationBuilder.DropTable(
                name: "AlbumNote");

            migrationBuilder.DropIndex(
                name: "IX_Backgrounds_FileId",
                table: "Backgrounds");

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
    }
}
