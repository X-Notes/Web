using BI.helpers;
using BI.services;
using BI.services.backgrounds;
using BI.services.encryption;
using BI.services.files;
using BI.services.folders;
using BI.services.history;
using BI.services.labels;
using BI.services.notes;
using BI.services.permissions;
using BI.services.relatedNotes;
using BI.services.search;
using BI.services.sharing;
using BI.services.user;
using BI.signalR;
using Common.Azure;
using Common.DatabaseModels.models.Files;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.backgrounds;
using Common.DTO.files;
using Common.DTO.folders;
using Common.DTO.history;
using Common.DTO.labels;
using Common.DTO.notes;
using Common.DTO.notes.FullNoteContent;
using Common.DTO.permissions;
using Common.DTO.search;
using Common.DTO.users;
using ContentProcessing;
using Domain.Commands.backgrounds;
using Domain.Commands.encryption;
using Domain.Commands.files;
using Domain.Commands.folderInner;
using Domain.Commands.folders;
using Domain.Commands.labels;
using Domain.Commands.noteInner;
using Domain.Commands.noteInner.fileContent.albums;
using Domain.Commands.noteInner.fileContent.audios;
using Domain.Commands.noteInner.fileContent.files;
using Domain.Commands.noteInner.fileContent.videos;
using Domain.Commands.notes;
using Domain.Commands.orders;
using Domain.Commands.relatedNotes;
using Domain.Commands.share.folders;
using Domain.Commands.share.notes;
using Domain.Commands.users;
using Domain.Queries.backgrounds;
using Domain.Queries.encryption;
using Domain.Queries.files;
using Domain.Queries.folders;
using Domain.Queries.history;
using Domain.Queries.innerFolder;
using Domain.Queries.labels;
using Domain.Queries.notes;
using Domain.Queries.permissions;
using Domain.Queries.relatedNotes;
using Domain.Queries.search;
using Domain.Queries.sharing;
using Domain.Queries.users;
using FacadeML;
using FakeData;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using Storage;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WriteContext;
using WriteContext.GenericRepositories;
using WriteContext.Repositories;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Notifications;
using WriteContext.Repositories.Users;

namespace WriteAPI.ConfigureAPP
{
    public static class ConfigureHelper
    {

        public static void Mediatr(this IServiceCollection services)
        {
            services.AddMediatR(typeof(Startup));

            // USER
            services.AddScoped<IRequestHandler<GetShortUser, ShortUser>, UserHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserMemory, GetUserMemoryResponse>, UserHandlerQuery>();

            services.AddScoped<IRequestHandler<NewUserCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateMainUserInfoCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdatePhotoCommand, AnswerChangeUserPhoto>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateLanguageCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateThemeCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateFontSizeCommand, Unit>, UserHandlerСommand>();

            // Backgrounds
            services.AddScoped<IRequestHandler<RemoveBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<DefaultBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<NewBackgroundCommand, BackgroundDTO>, BackgroundHandlerCommand>();

            services.AddScoped<IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>, BackgroundHandlerQuery>();

            //Labels
            services.AddScoped<IRequestHandler<GetLabelsByEmail, LabelsDTO>, LabelHandlerQuery>();
            services.AddScoped<IRequestHandler<GetCountNotesByLabel, int>, LabelHandlerQuery>();

            services.AddScoped<IRequestHandler<NewLabelCommand, Guid>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeleteLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeletedLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<RestoreLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveAllFromBinCommand, Unit>, LabelHandlerCommand>();


            //Notes
            services.AddScoped<IRequestHandler<NewPrivateNoteCommand, SmallNote>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeColorNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeleteNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteNotesCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<ArchiveNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePrivateNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyNoteCommand, List<SmallNote>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveLabelFromNoteCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<AddLabelOnNoteCommand, Unit>, NoteHandlerCommand>();

            services.AddScoped<IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetAllNotesQuery, List<SmallNote>>, NoteHandlerQuery>();

            services.AddScoped<IRequestHandler<GetFullNoteQuery, FullNoteAnswer>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetOnlineUsersOnNote, List<OnlineUserOnNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNoteContentsQuery, List<BaseContentNoteDTO>>, NoteHandlerQuery>();

            // RELATED NOTES
            services.AddScoped<IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>, RelatedNotesHandlerQuery>();
            services.AddScoped<IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>, RelatedNotesHandlerQuery>();

            // FULL NOTE
            services.AddScoped<IRequestHandler<UpdateTitleNoteCommand, Unit>, FullNoteTextHandlerCommand>();           
            services.AddScoped<IRequestHandler<NewLineTextContentNoteCommand, OperationResult<TextNoteDTO>>, FullNoteTextHandlerCommand>();
            services.AddScoped<IRequestHandler<InsertLineCommand, OperationResult<TextNoteDTO>>, FullNoteTextHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateTextNoteCommand, Unit>, FullNoteTextHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformTextTypeCommand, OperationResult<Unit>>, FullNoteTextHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveContentCommand, OperationResult<Unit>>, FullNoteTextHandlerCommand>();
            services.AddScoped<IRequestHandler<ConcatWithPreviousCommand, OperationResult<TextNoteDTO>>, FullNoteTextHandlerCommand>();


            // FULL NOTE ALBUM
            services.AddScoped<IRequestHandler<RemoveAlbumCommand, OperationResult<Unit>>, FullNoteAlbumHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeAlbumRowCountCommand, OperationResult<Unit>>, FullNoteAlbumHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeAlbumSizeCommand, OperationResult<Unit>>, FullNoteAlbumHandlerCommand>();
            services.AddScoped<IRequestHandler<RemovePhotoFromAlbumCommand, OperationResult<Unit>>, FullNoteAlbumHandlerCommand>();
            services.AddScoped<IRequestHandler<UploadPhotosToAlbum, OperationResult<List<Guid>>>, FullNoteAlbumHandlerCommand>();
            services.AddScoped<IRequestHandler<InsertAlbumToNoteCommand, OperationResult<AlbumNoteDTO>>, FullNoteAlbumHandlerCommand>();

            // FULL NOTE AUDIOS
            services.AddScoped<IRequestHandler<InsertAudiosToNoteCommand, OperationResult<AudiosPlaylistNoteDTO>>, FullNoteAudioHandlerCommand>();

            // FULL NOTE VIDEOS
            services.AddScoped<IRequestHandler<InsertVideosToNoteCommand, OperationResult<VideoNoteDTO>>, FullNoteVideoHandlerCommand>();

            // FULL NOTE DOCUMENTS
            services.AddScoped<IRequestHandler<InsertFilesToNoteCommand, OperationResult<DocumentNoteDTO>>, FullNoteDocumentHandlerCommand>();


            //FOLDERS
            services.AddScoped<IRequestHandler<NewFolderCommand, SmallFolder>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<ArchiveFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeColorFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<RestoreFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeleteFolderCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyFolderCommand, List<SmallFolder>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteFoldersCommand, Unit>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePrivateFolderCommand, Unit>, FolderHandlerCommand>();

            services.AddScoped<IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetFullFolderQuery, FullFolderAnswer>, FolderHandlerQuery>();

            // FULL-FOLDER
            services.AddScoped<IRequestHandler<UpdateTitleFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateNotesInFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveNotesFromFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();

            services.AddScoped<IRequestHandler<GetFolderNotesByFolderId, List<SmallNote>>, FullFolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<PreviewNoteForSelection>>, FullFolderHandlerQuery>();

            //Order
            services.AddScoped<IRequestHandler<UpdateOrderCommand, Unit>, OrderHandlerCommand>();

            //SHARE
            services.AddScoped<IRequestHandler<GetUsersOnPrivateNote, List<InvitedUsersToFoldersOrNote>>, SharingHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUsersOnPrivateFolder, List<InvitedUsersToFoldersOrNote>>, SharingHandlerQuery>();

            services.AddScoped<IRequestHandler<ChangeRefTypeFolders, Unit>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeRefTypeNotes, Unit>, SharingHandlerCommand>();

            services.AddScoped<IRequestHandler<PermissionUserOnPrivateNotes, Unit>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveUserFromPrivateNotes, Unit>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<SendInvitesToUsersNotes, Unit>, SharingHandlerCommand>();

            services.AddScoped<IRequestHandler<PermissionUserOnPrivateFolders, Unit>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveUserFromPrivateFolders, Unit>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<SendInvitesToUsersFolders, Unit>, SharingHandlerCommand>();

            //LOCK
            services.AddScoped<IRequestHandler<DecriptionNoteCommand, OperationResult<bool>>, EncryptionHandlerCommand>();
            services.AddScoped<IRequestHandler<EncryptionNoteCommand, OperationResult<bool>>, EncryptionHandlerCommand>();
            services.AddScoped<IRequestHandler<UnlockNoteQuery, OperationResult<bool>>, EncryptionHandlerQuery>();

            // HISTORY
            services.AddScoped<IRequestHandler<GetNoteHistories, List<NoteHistoryDTO>>, HistoryHandlerQuery>();

            // SEARCH
            services.AddScoped<IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>, SeachQueryHandler>();
            services.AddScoped<IRequestHandler<GetNotesAndFolderForSearch, SearchNoteFolderResult>, SeachQueryHandler>();


            //Files
            services.AddScoped<IRequestHandler<GetFileById, FilesBytes>, FilesHandlerQuery>();
            services.AddScoped<IRequestHandler<SavePhotosToNoteCommand, List<SavePhotosToNoteResponse>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveVideosToNoteCommand, AppFile>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveDocumentsToNoteCommand, AppFile>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveFilesByPathesCommand, Unit>, FileHandlerCommand>();

            // Permissions
            services.AddScoped<IRequestHandler<GetUserPermissionsForNote, UserPermissionsForNote>, PermissionHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForFolder, UserPermissionsForFolder>, PermissionHandlerQuery>();
        }
        public static void DataBase(this IServiceCollection services, IConfiguration Configuration)
        {
            string writeConnection = Configuration.GetSection("WriteDB").Value;
            Console.WriteLine(writeConnection);

            services.AddDbContext<WriteContextDB>(options => options.UseNpgsql(writeConnection));

            // NOTIFICATIONS 
            services.AddScoped<NotificationRepository>();

            // USERS
            services.AddScoped<UserRepository>();
            services.AddScoped<BackgroundRepository>();
            services.AddScoped<UserProfilePhotoRepository>();

            // FILES
            services.AddScoped<FileRepository>();
            services.AddScoped<AppRepository>();


            // NOTES
            services.AddScoped<NoteRepository>();
            services.AddScoped<UserOnNoteRepository>();
            services.AddScoped<ReletatedNoteToInnerNoteRepository>();
            services.AddScoped<UsersOnPrivateNotesRepository>();

            //LABELS
            services.AddScoped<LabelRepository>();
            services.AddScoped<LabelsNotesRepository>();

            // FOLDERS
            services.AddScoped<FolderRepository>();
            services.AddScoped<UsersOnPrivateFoldersRepository>();
            services.AddScoped<FoldersNotesRepository>();

            // Note Content 
            services.AddScoped<AlbumNoteRepository>();
            services.AddScoped<AudioNoteRepository>();
            services.AddScoped<VideoNoteRepository>();
            services.AddScoped<DocumentNoteRepository>();
            services.AddScoped<TextNotesRepository>();
            services.AddScoped<BaseNoteContentRepository>();
            services.AddScoped<SearchRepository>();

            // History
            services.AddScoped<NoteHistoryRepository>();
            services.AddScoped<UserNoteHistoryManyToManyRepository>();


            services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        }

        public static void AzureConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            var configService = Configuration.GetSection("Azure").Get<AzureConfig>();
            services.AddScoped(x => configService);

            services.AddAzureClients(builder =>
            {
                builder.AddBlobServiceClient(configService.StorageConnection);
            });
        }

        public static void JWT(this IServiceCollection services, IConfiguration Configuration)
        {
            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Authority = Configuration["FirebaseOptions:Authority"];
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = Configuration["FirebaseOptions:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = Configuration["FirebaseOptions:Audience"],
                        ValidateLifetime = true
                    };

                    options.Events = new JwtBearerEvents()
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) &&
                                (path.StartsWithSegments("/hub")))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        },
                    };
                });
        }
        public static void BI(this IServiceCollection services)
        {
            services.AddScoped<UserGenerator>();
            services.AddScoped<DatabaseFakeDataBridge>();

            services.AddScoped<AppSignalRService>();

            services.AddScoped<OcrService>();
            services.AddSingleton<ObjectRecognizeService>();

            services.AddScoped<AppEncryptor>();

            services.AddSingleton<HistoryCacheService>();
            services.AddSingleton<HistoryService>();

            services.AddScoped<IImageProcessor, ImageProcessor>();
        }

        public static void FileStorage(this IServiceCollection services)
        {
            services.AddScoped<IFilesStorage, AzureFileStorage>();
        }
    }
}
