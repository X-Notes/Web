using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.History;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WriteContext.Migrations
{
    public partial class init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "Noots");

            migrationBuilder.CreateTable(
                name: "BillingPlans",
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                schema: "Noots",
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
                name: "SortedByTypes",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SortedByTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Themes",
                schema: "Noots",
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
                schema: "Noots",
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
                name: "AudioNoteAppFile",
                schema: "Noots",
                columns: table => new
                {
                    AppFileId = table.Column<Guid>(type: "uuid", nullable: false),
                    AudioNoteId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioNoteAppFile", x => new { x.AudioNoteId, x.AppFileId });
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "BillingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_FontSizes_FontSizeId",
                        column: x => x.FontSizeId,
                        principalSchema: "Noots",
                        principalTable: "FontSizes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_Languages_LanguageId",
                        column: x => x.LanguageId,
                        principalSchema: "Noots",
                        principalTable: "Languages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_Themes_ThemeId",
                        column: x => x.ThemeId,
                        principalSchema: "Noots",
                        principalTable: "Themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PathPhotoSmall = table.Column<string>(type: "text", nullable: true),
                    PathPhotoMedium = table.Column<string>(type: "text", nullable: true),
                    PathPhotoBig = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
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
                        principalSchema: "Noots",
                        principalTable: "FileTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Files_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Folders",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FolderTypeId = table.Column<int>(type: "integer", nullable: false),
                    RefTypeId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Folders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Folders_FoldersTypes_FolderTypeId",
                        column: x => x.FolderTypeId,
                        principalSchema: "Noots",
                        principalTable: "FoldersTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Folders_RefTypes_RefTypeId",
                        column: x => x.RefTypeId,
                        principalSchema: "Noots",
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Folders_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Labels",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Labels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Labels_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                schema: "Noots",
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
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_NotesTypes_NoteTypeId",
                        column: x => x.NoteTypeId,
                        principalSchema: "Noots",
                        principalTable: "NotesTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notes_RefTypes_RefTypeId",
                        column: x => x.RefTypeId,
                        principalSchema: "Noots",
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notes_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserToId",
                        column: x => x.UserToId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NotificationSettings",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PersonalizationSettings",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortedNoteByTypeId = table.Column<int>(type: "integer", nullable: false),
                    SortedFolderByTypeId = table.Column<int>(type: "integer", nullable: false),
                    NotesInFolderCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    ContentInNoteCount = table.Column<int>(type: "integer", nullable: false),
                    IsViewVideoOnNote = table.Column<bool>(type: "boolean", nullable: false),
                    IsViewAudioOnNote = table.Column<bool>(type: "boolean", nullable: false),
                    IsViewPhotosOnNote = table.Column<bool>(type: "boolean", nullable: false),
                    IsViewTextOnNote = table.Column<bool>(type: "boolean", nullable: false),
                    IsViewDocumentOnNote = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalizationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalizationSettings_SortedByTypes_SortedFolderByTypeId",
                        column: x => x.SortedFolderByTypeId,
                        principalSchema: "Noots",
                        principalTable: "SortedByTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonalizationSettings_SortedByTypes_SortedNoteByTypeId",
                        column: x => x.SortedNoteByTypeId,
                        principalSchema: "Noots",
                        principalTable: "SortedByTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonalizationSettings_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Backgrounds",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Backgrounds_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfilePhotos",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserProfilePhotos_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsersOnPrivateFolders",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Folders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsersOnPrivateFolders_RefTypes_AccessTypeId",
                        column: x => x.AccessTypeId,
                        principalSchema: "Noots",
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsersOnPrivateFolders_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FoldersNotes",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Folders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FoldersNotes_Notes_NoteId",
                        column: x => x.NoteId,
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LabelsNotes",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Labels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LabelsNotes_Notes_NoteId",
                        column: x => x.NoteId,
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NoteSnapshots",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteTypeId = table.Column<int>(type: "integer", nullable: false),
                    RefTypeId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    Labels = table.Column<List<HistoryLabel>>(type: "jsonb", nullable: true),
                    SnapshotTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoteSnapshots_Notes_NoteId",
                        column: x => x.NoteId,
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoteSnapshots_NotesTypes_NoteTypeId",
                        column: x => x.NoteTypeId,
                        principalSchema: "Noots",
                        principalTable: "NotesTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoteSnapshots_RefTypes_RefTypeId",
                        column: x => x.RefTypeId,
                        principalSchema: "Noots",
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReletatedNoteToInnerNotes",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReletatedNoteToInnerNotes_Notes_RelatedNoteId",
                        column: x => x.RelatedNoteId,
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserOnNoteNow",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnNoteNow_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserOnPrivateNotes",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnPrivateNotes_RefTypes_AccessTypeId",
                        column: x => x.AccessTypeId,
                        principalSchema: "Noots",
                        principalTable: "RefTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOnPrivateNotes_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BaseNoteContents",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: true),
                    NoteSnapshotId = table.Column<Guid>(type: "uuid", nullable: true),
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
                        principalSchema: "Noots",
                        principalTable: "ContentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BaseNoteContents_Notes_NoteId",
                        column: x => x.NoteId,
                        principalSchema: "Noots",
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BaseNoteContents_NoteSnapshots_NoteSnapshotId",
                        column: x => x.NoteSnapshotId,
                        principalSchema: "Noots",
                        principalTable: "NoteSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserNoteHistoryManyToMany",
                schema: "Noots",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteHistoryId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNoteHistoryManyToMany", x => new { x.UserId, x.NoteHistoryId });
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_NoteSnapshots_NoteHistoryId",
                        column: x => x.NoteHistoryId,
                        principalSchema: "Noots",
                        principalTable: "NoteSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserNoteHistoryManyToMany_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Noots",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlbumNote",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
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
                        principalSchema: "Noots",
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AudioNote",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AudioNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalSchema: "Noots",
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentNote",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalSchema: "Noots",
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TextNote",
                schema: "Noots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true),
                    NoteTextTypeId = table.Column<int>(type: "integer", nullable: false),
                    HTypeId = table.Column<int>(type: "integer", nullable: true),
                    Checked = table.Column<bool>(type: "boolean", nullable: true),
                    IsBold = table.Column<bool>(type: "boolean", nullable: false),
                    IsItalic = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TextNote_BaseNoteContents_Id",
                        column: x => x.Id,
                        principalSchema: "Noots",
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TextNote_HTypes_HTypeId",
                        column: x => x.HTypeId,
                        principalSchema: "Noots",
                        principalTable: "HTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TextNote_NoteTextTypes_NoteTextTypeId",
                        column: x => x.NoteTextTypeId,
                        principalSchema: "Noots",
                        principalTable: "NoteTextTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoNote",
                schema: "Noots",
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
                        principalSchema: "Noots",
                        principalTable: "BaseNoteContents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VideoNote_Files_AppFileId",
                        column: x => x.AppFileId,
                        principalSchema: "Noots",
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "BillingPlans",
                columns: new[] { "Id", "MaxSize", "Name" },
                values: new object[,]
                {
                    { 3, 1000000000L, "Business" },
                    { 2, 500000000L, "Standart" },
                    { 1, 100000000L, "Free" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "ContentTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 4, "PlaylistAudios" },
                    { 5, "Video" },
                    { 3, "Document" },
                    { 2, "Album" },
                    { 1, "Text" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "FileTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Audio" },
                    { 3, "Video" },
                    { 4, "Document" },
                    { 2, "Photo" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "FoldersTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 2, "Shared" },
                    { 1, "Private" },
                    { 3, "Archived" },
                    { 4, "Deleted" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "FontSizes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Big" },
                    { 2, "Medium" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "HTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "H1" },
                    { 3, "H3" },
                    { 2, "H2" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "Languages",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 3, "Russian" },
                    { 2, "Ukraine" },
                    { 1, "English" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "NoteTextTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 4, "Numberlist" },
                    { 3, "Dotlist" },
                    { 2, "Heading" },
                    { 1, "Default" },
                    { 5, "Checklist" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "NotesTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 4, "Deleted" },
                    { 2, "Shared" },
                    { 1, "Private" },
                    { 3, "Archived" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "RefTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Viewer" },
                    { 2, "Editor" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "SortedByTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 2, "DescDate" },
                    { 1, "AscDate" },
                    { 3, "CustomOrder" }
                });

            migrationBuilder.InsertData(
                schema: "Noots",
                table: "Themes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Dark" },
                    { 2, "Light" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlbumNoteAppFiles_AppFileId",
                schema: "Noots",
                table: "AlbumNoteAppFiles",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_AudioNoteAppFile_AppFileId",
                schema: "Noots",
                table: "AudioNoteAppFile",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_Backgrounds_FileId",
                schema: "Noots",
                table: "Backgrounds",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_Backgrounds_UserId",
                schema: "Noots",
                table: "Backgrounds",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_ContentTypeId",
                schema: "Noots",
                table: "BaseNoteContents",
                column: "ContentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NoteId",
                schema: "Noots",
                table: "BaseNoteContents",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseNoteContents_NoteSnapshotId",
                schema: "Noots",
                table: "BaseNoteContents",
                column: "NoteSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentNote_AppFileId",
                schema: "Noots",
                table: "DocumentNote",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_Files_FileTypeId",
                schema: "Noots",
                table: "Files",
                column: "FileTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Files_UserId",
                schema: "Noots",
                table: "Files",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_FolderTypeId",
                schema: "Noots",
                table: "Folders",
                column: "FolderTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_RefTypeId",
                schema: "Noots",
                table: "Folders",
                column: "RefTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_UserId",
                schema: "Noots",
                table: "Folders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FoldersNotes_FolderId",
                schema: "Noots",
                table: "FoldersNotes",
                column: "FolderId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_UserId",
                schema: "Noots",
                table: "Labels",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LabelsNotes_LabelId",
                schema: "Noots",
                table: "LabelsNotes",
                column: "LabelId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_NoteTypeId",
                schema: "Noots",
                table: "Notes",
                column: "NoteTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_RefTypeId",
                schema: "Noots",
                table: "Notes",
                column: "RefTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UserId",
                schema: "Noots",
                table: "Notes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteSnapshots_NoteId",
                schema: "Noots",
                table: "NoteSnapshots",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteSnapshots_NoteTypeId",
                schema: "Noots",
                table: "NoteSnapshots",
                column: "NoteTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteSnapshots_RefTypeId",
                schema: "Noots",
                table: "NoteSnapshots",
                column: "RefTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserFromId",
                schema: "Noots",
                table: "Notifications",
                column: "UserFromId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserToId",
                schema: "Noots",
                table: "Notifications",
                column: "UserToId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSettings_UserId",
                schema: "Noots",
                table: "NotificationSettings",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizationSettings_SortedFolderByTypeId",
                schema: "Noots",
                table: "PersonalizationSettings",
                column: "SortedFolderByTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizationSettings_SortedNoteByTypeId",
                schema: "Noots",
                table: "PersonalizationSettings",
                column: "SortedNoteByTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizationSettings_UserId",
                schema: "Noots",
                table: "PersonalizationSettings",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReletatedNoteToInnerNotes_RelatedNoteId",
                schema: "Noots",
                table: "ReletatedNoteToInnerNotes",
                column: "RelatedNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_TextNote_HTypeId",
                schema: "Noots",
                table: "TextNote",
                column: "HTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_TextNote_NoteTextTypeId",
                schema: "Noots",
                table: "TextNote",
                column: "NoteTextTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNoteHistoryManyToMany_NoteHistoryId",
                schema: "Noots",
                table: "UserNoteHistoryManyToMany",
                column: "NoteHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnNoteNow_NoteId",
                schema: "Noots",
                table: "UserOnNoteNow",
                column: "NoteId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnPrivateNotes_AccessTypeId",
                schema: "Noots",
                table: "UserOnPrivateNotes",
                column: "AccessTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOnPrivateNotes_UserId",
                schema: "Noots",
                table: "UserOnPrivateNotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfilePhotos_AppFileId",
                schema: "Noots",
                table: "UserProfilePhotos",
                column: "AppFileId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_BillingPlanId",
                schema: "Noots",
                table: "Users",
                column: "BillingPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CurrentBackgroundId",
                schema: "Noots",
                table: "Users",
                column: "CurrentBackgroundId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                schema: "Noots",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_FontSizeId",
                schema: "Noots",
                table: "Users",
                column: "FontSizeId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_LanguageId",
                schema: "Noots",
                table: "Users",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ThemeId",
                schema: "Noots",
                table: "Users",
                column: "ThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_UsersOnPrivateFolders_AccessTypeId",
                schema: "Noots",
                table: "UsersOnPrivateFolders",
                column: "AccessTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_UsersOnPrivateFolders_UserId",
                schema: "Noots",
                table: "UsersOnPrivateFolders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoNote_AppFileId",
                schema: "Noots",
                table: "VideoNote",
                column: "AppFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFiles_AlbumNote_AlbumNoteId",
                schema: "Noots",
                table: "AlbumNoteAppFiles",
                column: "AlbumNoteId",
                principalSchema: "Noots",
                principalTable: "AlbumNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumNoteAppFiles_Files_AppFileId",
                schema: "Noots",
                table: "AlbumNoteAppFiles",
                column: "AppFileId",
                principalSchema: "Noots",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AudioNoteAppFile_AudioNote_AudioNoteId",
                schema: "Noots",
                table: "AudioNoteAppFile",
                column: "AudioNoteId",
                principalSchema: "Noots",
                principalTable: "AudioNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AudioNoteAppFile_Files_AppFileId",
                schema: "Noots",
                table: "AudioNoteAppFile",
                column: "AppFileId",
                principalSchema: "Noots",
                principalTable: "Files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Backgrounds_CurrentBackgroundId",
                schema: "Noots",
                table: "Users",
                column: "CurrentBackgroundId",
                principalSchema: "Noots",
                principalTable: "Backgrounds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Backgrounds_Files_FileId",
                schema: "Noots",
                table: "Backgrounds");

            migrationBuilder.DropForeignKey(
                name: "FK_Backgrounds_Users_UserId",
                schema: "Noots",
                table: "Backgrounds");

            migrationBuilder.DropTable(
                name: "AlbumNoteAppFiles",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "AudioNoteAppFile",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "DocumentNote",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "FoldersNotes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "LabelsNotes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Notifications",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "NotificationSettings",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "PersonalizationSettings",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "ReletatedNoteToInnerNotes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "TextNote",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "UserNoteHistoryManyToMany",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "UserOnNoteNow",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "UserOnPrivateNotes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "UserProfilePhotos",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "UsersOnPrivateFolders",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "VideoNote",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "AlbumNote",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "AudioNote",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Labels",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "SortedByTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "HTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "NoteTextTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Folders",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "BaseNoteContents",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "FoldersTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "ContentTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "NoteSnapshots",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Notes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "NotesTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "RefTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Files",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "FileTypes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Backgrounds",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "BillingPlans",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "FontSizes",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Languages",
                schema: "Noots");

            migrationBuilder.DropTable(
                name: "Themes",
                schema: "Noots");
        }
    }
}
