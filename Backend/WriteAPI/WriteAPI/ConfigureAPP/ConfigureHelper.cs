using Common.Azure;
using ContentProcessing;
using FakeData;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Storage;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BI.Services.Backgrounds;
using BI.Services.Encryption;
using BI.Services.Files;
using BI.Services.Folders;
using BI.Services.History;
using BI.Services.Labels;
using BI.Services.Notes;
using BI.Services.Permissions;
using BI.Services.Personalizations;
using BI.Services.RelatedNotes;
using BI.Services.Search;
using BI.Services.Sharing;
using BI.SignalR;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Backgrounds;
using Common.DTO.Files;
using Common.DTO.Folders;
using Common.DTO.History;
using Common.DTO.Labels;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Permissions;
using Common.DTO.Personalization;
using Common.DTO.Search;
using Common.DTO.Users;
using Domain.Commands.Backgrounds;
using Domain.Commands.Encryption;
using Domain.Commands.Files;
using Domain.Commands.FolderInner;
using Domain.Commands.Folders;
using Domain.Commands.Labels;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Commands.NoteInner.FileContent.Videos;
using Domain.Commands.Notes;
using Domain.Commands.Personalizations;
using Domain.Commands.RelatedNotes;
using Domain.Commands.Share.Folders;
using Domain.Commands.Share.Notes;
using Domain.Commands.Users;
using Domain.Queries.Backgrounds;
using Domain.Queries.Encryption;
using Domain.Queries.Files;
using Domain.Queries.Folders;
using Domain.Queries.History;
using Domain.Queries.InnerFolder;
using Domain.Queries.Labels;
using Domain.Queries.Notes;
using Domain.Queries.Permissions;
using Domain.Queries.Personalization;
using Domain.Queries.RelatedNotes;
using Domain.Queries.Search;
using Domain.Queries.Sharing;
using Domain.Queries.Users;
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
using Common.DTO.Notes.AdditionalContent;
using BI.Services.UserHandlers;
using Hangfire;
using Hangfire.PostgreSql;
using BI.JobsHandlers;
using Domain.Commands.NoteInner.FileContent.Texts;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Commands.NoteInner;
using Common.DTO;
using WriteContext.Repositories.Files;
using Domain.Commands.NoteInner.FileContent.Files;
using Common.DTO.Folders.AdditionalContent;
using BI.Services.Auth;
using Common.Timers;

namespace WriteAPI.ConfigureAPP
{
    public static class ConfigureHelper
    {

        public static void Mediatr(this IServiceCollection services)
        {
            services.AddMediatR(typeof(Startup));

            // USER
            services.AddScoped<IRequestHandler<GetShortUserQuery, OperationResult<ShortUser>>, UserHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserMemoryQuery, GetUserMemoryResponse>, UserHandlerQuery>();

            services.AddScoped<IRequestHandler<NewUserCommand, Guid>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateMainUserInfoCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdatePhotoCommand, OperationResult<AnswerChangeUserPhoto>>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateLanguageCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateThemeCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateFontSizeCommand, Unit>, UserHandlerСommand>();


            // Backgrounds
            services.AddScoped<IRequestHandler<RemoveBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<DefaultBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateBackgroundCommand, Unit>, BackgroundHandlerCommand>();
            services.AddScoped<IRequestHandler<NewBackgroundCommand, OperationResult<BackgroundDTO>>, BackgroundHandlerCommand>();

            services.AddScoped<IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>, BackgroundHandlerQuery>();

            //Labels
            services.AddScoped<IRequestHandler<GetLabelsQuery, List<LabelDTO>>, LabelHandlerQuery>();
            services.AddScoped<IRequestHandler<GetCountNotesByLabelQuery, int>, LabelHandlerQuery>();

            services.AddScoped<IRequestHandler<NewLabelCommand, Guid>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeletedLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<RestoreLabelCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveAllFromBinCommand, Unit>, LabelHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdatePositionsLabelCommand, OperationResult<Unit>>, LabelHandlerCommand>();

            //Notes
            services.AddScoped<IRequestHandler<NewPrivateNoteCommand, SmallNote>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeColorNoteCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeleteNoteCommand, OperationResult<List<Guid>>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteNotesCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<ArchiveNoteCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePrivateNoteCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyNoteCommand, OperationResult<List<Guid>>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<MakeNoteHistoryCommand, Unit>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdatePositionsNotesCommand, OperationResult<Unit>>, NoteHandlerCommand>();

            services.AddScoped<IRequestHandler<GetAdditionalContentNoteInfoQuery, List<BottomNoteContent>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNotesByNoteIdsQuery, OperationResult<List<SmallNote>>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetAllNotesQuery, List<SmallNote>>, NoteHandlerQuery>();

            services.AddScoped<IRequestHandler<GetFullNoteQuery, OperationResult<FullNoteAnswer>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNoteContentsQuery, OperationResult<List<BaseNoteContentDTO>>>, NoteHandlerQuery>();

            // RELATED NOTES
            services.AddScoped<IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>, RelatedNotesHandlerQuery>();
            services.AddScoped<IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>, RelatedNotesHandlerQuery>();

            // FULL NOTE TEXT
            services.AddScoped<IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>, FullNoteTextHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateTextContentsCommand, OperationResult<Unit>>, FullNoteTextHandlerCommand>();

            // FULL NOTE CONTENT
            services.AddScoped<IRequestHandler<SyncNoteStructureCommand, OperationResult<Unit>>, FullNoteContentHandlerCommand>();


            // FULL NOTE ALBUM
            services.AddScoped<IRequestHandler<UnlinkFilesAndRemovePhotosCollectionsCommand, OperationResult<Unit>>, FullNotePhotosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<RemovePhotosFromCollectionCommand, OperationResult<Unit>>, FullNotePhotosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdatePhotosCollectionInfoCommand, OperationResult<Unit>>, FullNotePhotosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToPhotosCollectionCommand, OperationResult<PhotosCollectionNoteDTO>>, FullNotePhotosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddPhotosToCollectionCommand, OperationResult<Unit>>, FullNotePhotosCollectionHandlerCommand>();

            // FULL NOTE AUDIOS
            services.AddScoped<IRequestHandler<UnlinkFilesAndRemoveAudiosCollectionsCommand, OperationResult<Unit>>, FullNoteAudiosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveAudiosFromCollectionCommand, OperationResult<Unit>>, FullNoteAudiosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateAudiosCollectionInfoCommand, OperationResult<Unit>>, FullNoteAudiosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToAudiosCollectionCommand, OperationResult<AudiosCollectionNoteDTO>>, FullNoteAudiosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddAudiosToCollectionCommand, OperationResult<Unit>>, FullNoteAudiosCollectionHandlerCommand>();

            // FULL NOTE VIDEOS
            services.AddScoped<IRequestHandler<UnlinkFilesAndRemoveVideosCollectionsCommand, OperationResult<Unit>>, FullNoteVideosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveVideosFromCollectionCommand, OperationResult<Unit>>, FullNoteVideosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>, FullNoteVideosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddVideosToCollectionCommand, OperationResult<Unit>>, FullNoteVideosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateVideosCollectionInfoCommand, OperationResult<Unit>>, FullNoteVideosCollectionHandlerCommand>();

            // FULL NOTE DOCUMENTS
            services.AddScoped<IRequestHandler<UnlinkFilesAndRemoveDocumentsCollectionsCommand, OperationResult<Unit>>, FullNoteDocumentsCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveDocumentsFromCollectionCommand, OperationResult<Unit>>, FullNoteDocumentsCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToDocumentsCollectionCommand, OperationResult<DocumentsCollectionNoteDTO>>, FullNoteDocumentsCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddDocumentsToCollectionCommand, OperationResult<Unit>>, FullNoteDocumentsCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateDocumentsCollectionInfoCommand, OperationResult<Unit>>, FullNoteDocumentsCollectionHandlerCommand>();

            // FULL NOTE FILES
            services.AddScoped<IRequestHandler<UploadNoteFilesToStorageAndSaveCommand, OperationResult<List<AppFile>>>, FullNoteFilesCollectionHandlerCommand>();

            //FOLDERS
            services.AddScoped<IRequestHandler<NewFolderCommand, SmallFolder>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<ArchiveFolderCommand, OperationResult<Unit>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeColorFolderCommand, OperationResult<Unit>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<SetDeleteFolderCommand, OperationResult<List<Guid>>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyFolderCommand, List<SmallFolder>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<DeleteFoldersCommand, OperationResult<Unit>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<MakePrivateFolderCommand, OperationResult<Unit>>, FolderHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdatePositionsFoldersCommand, OperationResult<Unit>>, FolderHandlerCommand>();


            services.AddScoped<IRequestHandler<GetFoldersByFolderIdsQuery, OperationResult<List<SmallFolder>>>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetFullFolderQuery, FullFolderAnswer>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetAdditionalContentFolderInfoQuery, List<BottomFolderContent>>, FolderHandlerQuery>();

            // FULL-FOLDER
            services.AddScoped<IRequestHandler<UpdateTitleFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<AddNotesToFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveNotesFromFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateNotesPositionsInFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();

            services.AddScoped<IRequestHandler<GetFolderNotesByFolderIdQuery, List<SmallNote>>, FullFolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<SmallNote>>, FullFolderHandlerQuery>();

            //SHARE
            services.AddScoped<IRequestHandler<GetUsersOnPrivateNoteQuery, List<InvitedUsersToFoldersOrNote>>, SharingHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUsersOnPrivateFolderQuery, List<InvitedUsersToFoldersOrNote>>, SharingHandlerQuery>();

            services.AddScoped<IRequestHandler<ChangeRefTypeFolders, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeRefTypeNotes, OperationResult<Unit>>, SharingHandlerCommand>();

            services.AddScoped<IRequestHandler<PermissionUserOnPrivateNotes, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveUserFromPrivateNotes, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<SendInvitesToUsersNotes, OperationResult<Unit>>, SharingHandlerCommand>();

            services.AddScoped<IRequestHandler<PermissionUserOnPrivateFolders, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveUserFromPrivateFolders, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<SendInvitesToUsersFolders, Unit>, SharingHandlerCommand>();

            //LOCK
            services.AddScoped<IRequestHandler<DecriptionNoteCommand, OperationResult<bool>>, EncryptionHandlerCommand>();
            services.AddScoped<IRequestHandler<EncryptionNoteCommand, OperationResult<bool>>, EncryptionHandlerCommand>();
            services.AddScoped<IRequestHandler<UnlockNoteQuery, OperationResult<bool>>, EncryptionHandlerQuery>();

            // HISTORY
            services.AddScoped<IRequestHandler<GetNoteHistoriesQuery, OperationResult<List<NoteHistoryDTO>>>, HistoryHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNoteSnapshotQuery, OperationResult<NoteHistoryDTOAnswer>>, HistoryHandlerQuery>();
            services.AddScoped<IRequestHandler<GetSnapshotContentsQuery, OperationResult<List<BaseNoteContentDTO>>>, HistoryHandlerQuery>();

            // SEARCH
            services.AddScoped<IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>, SeachQueryHandler>();
            services.AddScoped<IRequestHandler<GetNotesAndFolderForSearchQuery, SearchNoteFolderResult>, SeachQueryHandler>();


            //Files
            services.AddScoped<IRequestHandler<GetFileByPathQuery, FilesBytes>, FilesHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserStorageMemoryQuery, GetUserMemoryResponse>, FilesHandlerQuery>();

            services.AddScoped<IRequestHandler<SavePhotosToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveVideosToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<CopyBlobFromContainerToContainerCommand, AppFile>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveDocumentsToNoteCommand, List<AppFile>>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveBackgroundCommand, AppFile>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<SaveUserPhotoCommand, AppFile>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveFilesCommand, Unit>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveFilesFromStorageCommand, Unit>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<CreateUserContainerCommand, Unit>, FileHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateFileMetaDataCommand, OperationResult<FileDTO>>, FileHandlerCommand>();

            // Permissions
            services.AddScoped<IRequestHandler<GetUserPermissionsForNoteQuery, UserPermissionsForNote>, PermissionHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForNotesManyQuery, List<(Guid, UserPermissionsForNote)>>, PermissionHandlerQuery>();

            services.AddScoped<IRequestHandler<GetUserPermissionsForFolderQuery, UserPermissionsForFolder>, PermissionHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForFoldersManyQuery, List<(Guid, UserPermissionsForFolder)>>, PermissionHandlerQuery>();

            services.AddScoped<IRequestHandler<GetPermissionUploadFileQuery, PermissionUploadFileEnum>, PermissionHandlerQuery>();

            // Personalizations
            services.AddScoped<IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>, PersonalizationHandlerQuery>();
            services.AddScoped<IRequestHandler<UpdatePersonalizationSettingsCommand, Unit>, PersonalizationHandlerCommand>();
        }

        public static void HangFireConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            string connectionString = Configuration.GetSection("WriteDB").Value;

            // Add Hangfire services.
            services.AddHangfire(configuration => configuration
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(connectionString));

            // Add the processing server as IHostedService
            services.AddHangfireServer();
        }


        public static void DataBase(this IServiceCollection services, IConfiguration Configuration)
        {
            string writeConnection = Configuration.GetSection("WriteDB").Value;

            services.AddDbContext<WriteContextDB>(options => options.UseNpgsql(writeConnection));

            // NOTIFICATIONS 
            services.AddScoped<NotificationRepository>();

            // USERS
            services.AddScoped<UserRepository>();
            services.AddScoped<BackgroundRepository>();
            services.AddScoped<UserProfilePhotoRepository>();
            services.AddScoped<BillingPlanRepository>();

            // FILES
            services.AddScoped<FileRepository>();
            services.AddScoped<AppFileUploadInfoRepository>();


            // APP
            services.AddScoped<AppRepository>();


            // NOTES
            services.AddScoped<NoteRepository>();
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
            services.AddScoped<CollectionNoteRepository>();
            services.AddScoped<CollectionAppFileRepository>();

            services.AddScoped<TextNotesRepository>();
            services.AddScoped<BaseNoteContentRepository>();
            services.AddScoped<SearchRepository>();

            // History
            services.AddScoped<NoteSnapshotRepository>();
            services.AddScoped<UserNoteHistoryManyToManyRepository>();
            services.AddScoped<SnapshotFileContentRepository>();

            // Personalization
            services.AddScoped<PersonalizationSettingRepository>();

            services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        }

        public static void AzureConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            var configService = Configuration.GetSection("Azure").Get<AzureConfig>();
            services.AddSingleton(x => configService);

            services.AddAzureClients(builder =>
            {
                builder.AddBlobServiceClient(configService.StorageConnectionEmulator);
            });
        }

        public static void TimersConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            var configService = Configuration.GetSection("Timers").Get<TimersConfig>();
            services.AddSingleton(x => configService);

            var hostedConfigService = Configuration.GetSection("HostedTimers").Get<HostedTimersConfig>();
            services.AddSingleton(x => hostedConfigService);
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
            services.AddScoped<FirebaseAuthService>();

            services.AddScoped<UserGenerator>();
            services.AddScoped<DatabaseFakeDataBridge>();

            services.AddScoped<AppSignalRService>();
            services.AddScoped<FolderWSUpdateService>();
            services.AddScoped<NoteWSUpdateService>();

            services.AddScoped<CollectionLinkedService>();

            services.AddSingleton<WebsocketsNotesServiceStorage>();
            services.AddSingleton<WebsocketsFoldersServiceStorage>();
            services.AddSingleton<UserNoteEncryptStorage>();

            services.AddSingleton<AppEncryptor>();

            services.AddScoped<IImageProcessor, ImageProcessor>();

            // BACKGROUND JOBS
            services.AddScoped<EntitiesDeleteJobHandler>();

            services.AddSingleton<ConfigForHistoryMaker>();
            services.AddSingleton<HistoryCacheServiceStorage>();
            services.AddSingleton<HistoryJobHandler>();

            services.AddScoped<UnlinkedFilesDeleteJobHandler>();
        }

        public static void FileStorage(this IServiceCollection services)
        {
            services.AddScoped<IFilesStorage, AzureFileStorage>();
        }
    }
}
