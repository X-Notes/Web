using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class initphotos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillingPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    MaxSize = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContentTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FileTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FoldersTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoldersTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FontSizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FontSizes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Languages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Languages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotesTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotesTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NoteTextTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteTextTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RefTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Themes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Themes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AlbumNoteAppFiles",
                columns: table => new
                {
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false),
                    AlbumNoteId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlbumNoteAppFiles", x => new { x.AlbumNoteId, x.AppFileId });
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PersonalKey = table.Column<string>(type: "text", nullable: true),
                    LanguageId = table.Column<int>(type: "integer", nullable: false),
                    CurrentBackgroundId = table.Column<Guid>(type: "uuid", nullable: true),
                    ThemeId = table.Column<int>(type: "integer", nullable: false),
                    FontSizeId = table.Column<int>(type: "integer", nullable: false),
                    BillingPlanId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_BillingPlans_BillingPlanId",
                        column: x => x.BillingPlanId,
                        principalTable: "BillingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_FontSizes_FontSizeId",
                        column: x => x.FontSizeId,
                        principalTable: "FontSizes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_Languages_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Languages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_Themes_ThemeId",
                        column: x => x.ThemeId,
                        principalTable: "Themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PathPhotoSmall = table.Column<string>(type: "text", nullable: true),
                    PathPhotoMedium = table.Column<string>(type: "text", nullable: true),
                    PathPhotoBig = table.Column<string>(type: "text", nullable: true),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    PathNonPhotoContent = table.Column<string>(type: "text", nullable: true),
                    ContentType = table.Column<string>(type: "text", nullable: true),
                    FileTypeId = table.Column<int>(type: "integer", nullable: false),
                    TextFromPhoto = table.Column<string>(type: "text", nullable: true),
                    RecognizeObject = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Files", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Files_FileTypes_FileTypeId",
                        column: x => x.FileTypeId,
                        principalTable: "FileTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Files_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Folders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FolderTypeId = table.Column<int>(type: "integer", nullable: false),
                    RefTypeId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Folders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Folders_FoldersTypes_FolderTypeId",
                        column: x => x.FolderTypeId,
                        principalTable: "FoldersTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Folders_RefTypes_RefTypeId",
                        column: x => x.RefTypeId,
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Folders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Labels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Labels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Labels_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteTypeId = table.Column<int>(type: "integer", nullable: false),
                    RefTypeId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: true),
                    IsHistory = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_NotesTypes_NoteTypeId",
                        column: x => x.NoteTypeId,
                        principalTable: "NotesTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notes_RefTypes_RefTypeId",
                        column: x => x.RefTypeId,
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserFromId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserToId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsSystemMessage = table.Column<bool>(type: "boolean", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserFromId",
                        column: x => x.UserFromId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserToId",
                        column: x => x.UserToId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NotificationSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Backgrounds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Backgrounds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Backgrounds_Files_FileId",
                        column: x => x.FileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Backgrounds_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfilePhotos",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfilePhotos", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserProfilePhotos_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserProfilePhotos_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsersOnPrivateFolders",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FolderId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessTypeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsersOnPrivateFolders", x => new { x.FolderId, x.UserId });
                    table.ForeignKey(
                        name: "FK_UsersOnPrivateFolders_Folders_FolderId",
                        column: x => x.FolderId,
                        principalTable: "Folders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsersOnPrivateFolders_RefTypes_AccessTypeId",
                        column: x => x.AccessTypeId,
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsersOnPrivateFolders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BaseNoteContents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    ContentTypeId = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaseNoteContents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaseNoteContents_ContentTypes_ContentTypeId",
                        column: x => x.ContentTypeId,
                        principalTable: "ContentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BaseNoteContents_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FoldersNotes",
                columns: table => new
                {
                    FolderId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoldersNotes", x => new { x.NoteId, x.FolderId });
                    table.ForeignKey(
                        name: "FK_FoldersNotes_Folders_FolderId",
                        column: x => x.FolderId,
                        principalTable: "Folders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FoldersNotes_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LabelsNotes",
                columns: table => new
                {
                    LabelId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabelsNotes", x => new { x.NoteId, x.LabelId });
                    table.ForeignKey(
                        name: "FK_LabelsNotes_Labels_LabelId",
                        column: x => x.LabelId,
                        principalTable: "Labels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LabelsNotes_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateTable(
                name: "ReletatedNoteToInnerNotes",
                columns: table => new
                {
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    RelatedNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsOpened = table.Column<bool>(type: "boolean", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReletatedNoteToInnerNotes", x => new { x.NoteId, x.RelatedNoteId });
                    table.ForeignKey(
                        name: "FK_ReletatedNoteToInnerNotes_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReletatedNoteToInnerNotes_Notes_RelatedNoteId",
                        column: x => x.RelatedNoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserOnNoteNow",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOnNoteNow", x => new { x.UserId, x.NoteId });
                    table.ForeignKey(
                        name: "FK_UserOnNoteNow_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnNoteNow_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserOnPrivateNotes",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessTypeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOnPrivateNotes", x => new { x.NoteId, x.UserId });
                    table.ForeignKey(
                        name: "FK_UserOnPrivateNotes_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnPrivateNotes_RefTypes_AccessTypeId",
                        column: x => x.AccessTypeId,
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnPrivateNotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlbumNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Width = table.Column<string>(type: "text", nullable: true),
                    Height = table.Column<string>(type: "text", nullable: true),
                    CountInRow = table.Column<int>(type: "integer", nullable: false)
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
                name: "AudioNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AudioNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AudioNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TextNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true),
                    NoteTextTypeId = table.Column<int>(type: "integer", nullable: false),
                    HTypeId = table.Column<int>(type: "integer", nullable: true),
                    Checked = table.Column<bool>(type: "boolean", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_TextNote_HTypes_HTypeId",
                        column: x => x.HTypeId,
                        principalTable: "HTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TextNote_NoteTextTypes_NoteTextTypeId",
                        column: x => x.NoteTextTypeId,
                        principalTable: "NoteTextTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoNote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VideoNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserNoteHistoryManyToMany",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteHistoryId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNoteHistoryManyToMany", x => new { x.UserId, x.NoteHistoryId });
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_NoteHistories_NoteHistoryId",
                        column: x => x.NoteHistoryId,
                        principalTable: "NoteHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "BillingPlans",
                columns: new[] { "Id", "MaxSize", "Name" },
                values: new object[,]
                {
                    { 3, 1000000000L, "Business" },
                    { 2, 500000000L, "Standart" },
                    { 1, 100000000L, "Basic" }
                });

            migrationBuilder.InsertData(
                table: "ContentTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 2, "Album" },
                    { 5, "Video" },
                    { 4, "Audio" },
                    { 3, "Document" },
                    { 1, "Text" }
                });

            migrationBuilder.InsertData(
                table: "FileTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Text" },
                    { 3, "Photo" },
                    { 4, "Video" },
                    { 5, "Document" },
                    { 2, "Audio" }
                });

            migrationBuilder.InsertData(
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 2, "Shared" },
                    { 4, "Deleted" },
                    { 1, "Private" },
                    { 3, "Archived" }
                });

            migrationBuilder.InsertData(
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Big" },
                    { 2, "Medium" }
                });

            migrationBuilder.InsertData(
                table: "HTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 3, "H3" },
                    { 2, "H2" },
                    { 1, "H1" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 2, "Ukraine" },
                    { 1, "English" },
                    { 3, "Russian" }
                });

            migrationBuilder.InsertData(
                table: "NoteTextTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 5, "Checklist" },
                    { 4, "Numberlist" },
                    { 3, "Dotlist" },
                    { 2, "Heading" },
                    { 1, "Default" }
                });

            migrationBuilder.InsertData(
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 2, "Shared" },
                    { 3, "Archived" },
                    { 1, "Private" },
                    { 4, "Deleted" }
                });

            migrationBuilder.InsertData(
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Viewer" },
                    { 2, "Editor" }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Dark" },
                    { 2, "Light" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlbumNoteAppFiles_AppFileId",
                table: "AlbumNoteAppFiles",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_AudioNote_AppFileId",
                table: "AudioNote",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_Backgrounds_FileId",
                table: "Backgrounds",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_Backgrounds_UserId",
                table: "Backgrounds",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_ContentTypeId",
                table: "BaseNoteContents",
                column: "ContentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NoteId",
                table: "BaseNoteContents",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentNote_AppFileId",
                table: "DocumentNote",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_Files_FileTypeId",
                table: "Files",
                column: "FileTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Files_UserId",
                table: "Files",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_FolderTypeId",
                table: "Folders",
                column: "FolderTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_RefTypeId",
                table: "Folders",
                column: "RefTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_UserId",
                table: "Folders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FoldersNotes_FolderId",
                table: "FoldersNotes",
                column: "FolderId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_UserId",
                table: "Labels",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LabelsNotes_LabelId",
                table: "LabelsNotes",
                column: "LabelId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteHistories_NoteId",
                table: "NoteHistories",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_NoteTypeId",
                table: "Notes",
                column: "NoteTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_RefTypeId",
                table: "Notes",
                column: "RefTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UserId",
                table: "Notes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserFromId",
                table: "Notifications",
                column: "UserFromId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserToId",
                table: "Notifications",
                column: "UserToId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSettings_UserId",
                table: "NotificationSettings",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNotes_RelatedNoteId",
                table: "ReletatedNoteToInnerNotes",
                column: "RelatedNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_TextNote_HTypeId",
                table: "TextNote",
                column: "HTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_TextNote_NoteTextTypeId",
                table: "TextNote",
                column: "NoteTextTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNoteHistoryManyToMany_NoteHistoryId",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnNoteNow_NoteId",
                table: "UserOnNoteNow",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnPrivateNotes_AccessTypeId",
                table: "UserOnPrivateNotes",
                column: "AccessTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnPrivateNotes_UserId",
                table: "UserOnPrivateNotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfilePhotos_AppFileId",
                table: "UserProfilePhotos",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_BillingPlanId",
                table: "Users",
                column: "BillingPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CurrentBackgroundId",
                table: "Users",
                column: "CurrentBackgroundId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_FontSizeId",
                table: "Users",
                column: "FontSizeId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_LanguageId",
                table: "Users",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ThemeId",
                table: "Users",
                column: "ThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_UsersOnPrivateFolders_AccessTypeId",
                table: "UsersOnPrivateFolders",
                column: "AccessTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UsersOnPrivateFolders_UserId",
                table: "UsersOnPrivateFolders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoNote_AppFileId",
                table: "VideoNote",
                column: "AppFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFiles_AlbumNote_AlbumNoteId",
                table: "AlbumNoteAppFiles",
                column: "AlbumNoteId",
                principalTable: "AlbumNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFiles_Files_AppFileId",
                table: "AlbumNoteAppFiles",
                column: "AppFileId",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                table: "Users",
                column: "CurrentBackgroundId",
                principalTable: "Backgrounds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Backgrounds_Files_FileId",
                table: "Backgrounds");

            migrationBuilder.DropForeignKey(
                name: "FK_Backgrounds_Users_UserId",
                table: "Backgrounds");

            migrationBuilder.DropTable(
                name: "AlbumNoteAppFiles");

            migrationBuilder.DropTable(
                name: "AudioNote");

            migrationBuilder.DropTable(
                name: "DocumentNote");

            migrationBuilder.DropTable(
                name: "FoldersNotes");

            migrationBuilder.DropTable(
                name: "LabelsNotes");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "NotificationSettings");

            migrationBuilder.DropTable(
                name: "ReletatedNoteToInnerNotes");

            migrationBuilder.DropTable(
                name: "TextNote");

            migrationBuilder.DropTable(
                name: "UserNoteHistoryManyToMany");

            migrationBuilder.DropTable(
                name: "UserOnNoteNow");

            migrationBuilder.DropTable(
                name: "UserOnPrivateNotes");

            migrationBuilder.DropTable(
                name: "UserProfilePhotos");

            migrationBuilder.DropTable(
                name: "UsersOnPrivateFolders");

            migrationBuilder.DropTable(
                name: "VideoNote");

            migrationBuilder.DropTable(
                name: "AlbumNote");

            migrationBuilder.DropTable(
                name: "Labels");

            migrationBuilder.DropTable(
                name: "HTypes");

            migrationBuilder.DropTable(
                name: "NoteTextTypes");

            migrationBuilder.DropTable(
                name: "NoteHistories");

            migrationBuilder.DropTable(
                name: "Folders");

            migrationBuilder.DropTable(
                name: "BaseNoteContents");

            migrationBuilder.DropTable(
                name: "FoldersTypes");

            migrationBuilder.DropTable(
                name: "ContentTypes");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "NotesTypes");

            migrationBuilder.DropTable(
                name: "RefTypes");

            migrationBuilder.DropTable(
                name: "Files");

            migrationBuilder.DropTable(
                name: "FileTypes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Backgrounds");

            migrationBuilder.DropTable(
                name: "BillingPlans");

            migrationBuilder.DropTable(
                name: "FontSizes");

            migrationBuilder.DropTable(
                name: "Languages");

            migrationBuilder.DropTable(
                name: "Themes");
        }
    }
}
