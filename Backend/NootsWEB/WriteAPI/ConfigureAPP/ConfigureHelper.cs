using FakeData;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BI.Services.Backgrounds;
using BI.Services.Folders;
using BI.Services.Labels;
using BI.Services.Notes;
using BI.Services.Personalizations;
using BI.Services.RelatedNotes;
using BI.Services.Sharing;
using BI.SignalR;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Backgrounds;
using Common.DTO.Folders;
using Common.DTO.Labels;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Personalization;
using Common.DTO.Users;
using Domain.Commands.Backgrounds;
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
using Domain.Queries.Folders;
using Domain.Queries.InnerFolder;
using Domain.Queries.Labels;
using Domain.Queries.Notes;
using Domain.Queries.Personalization;
using Domain.Queries.RelatedNotes;
using Domain.Queries.Sharing;
using Domain.Queries.Users;
using Common.DTO.Notes.AdditionalContent;
using BI.Services.UserHandlers;
using Domain.Commands.NoteInner.FileContent.Texts;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Commands.NoteInner;
using Common.DTO;
using Domain.Commands.NoteInner.FileContent.Files;
using Common.DTO.Folders.AdditionalContent;
using BI.Services.Auth;
using Common.DTO.WebSockets.ReletedNotes;
using BI.Services.DiffsMatchPatch;
using Common.DTO.Notes.FullNoteSyncContents;
using BI.Services.Notes.Audios;
using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Queries.NoteInner;
using BI.Services.Notes.Photos;
using BI.Services.Notes.Documents;
using BI.Services.Notes.Videos;
using Serilog;
using Serilog.Sinks.Elasticsearch;
using WriteAPI.Models;
using Noots.Encryption.Entities;
using Noots.Permissions;
using Noots.Storage;
using Noots.Storage.Queries;
using Noots.History;
using Noots.Encryption;
using Noots.Search;

namespace WriteAPI.ConfigureAPP
{
    public static class ConfigureHelper
    {

        public static void Mediatr(this IServiceCollection services)
        {
            services.AddMediatR(typeof(Program));

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
            services.AddScoped<IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>, NoteHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdatePositionsNotesCommand, OperationResult<Unit>>, NoteHandlerCommand>();

            services.AddScoped<IRequestHandler<GetAdditionalContentNoteInfoQuery, List<BottomNoteContent>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNotesByNoteIdsQuery, OperationResult<List<SmallNote>>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetAllNotesQuery, List<SmallNote>>, NoteHandlerQuery>();

            services.AddScoped<IRequestHandler<GetFullNoteQuery, OperationResult<FullNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>, NoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetNoteContentsQuery, OperationResult<List<BaseNoteContentDTO>>>, NoteHandlerQuery>();

            // RELATED NOTES
            services.AddScoped<IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<UpdateRelatedNotesWS>>, RelatedNotesHandlerCommand>();
            services.AddScoped<IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>, RelatedNotesHandlerCommand>();         
            services.AddScoped<IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>, RelatedNotesHandlerQuery>();

            // FULL NOTE TEXT
            services.AddScoped<IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>, FullNoteTextHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateTextContentsCommand, OperationResult<Unit>>, FullNoteTextHandlerCommand>();

            // FULL NOTE CONTENT
            services.AddScoped<IRequestHandler<SyncNoteStructureCommand, OperationResult<NoteStructureResult>>, FullNoteContentHandlerCommand>();


            // FULL NOTE PHOTOS
            services.AddScoped<IRequestHandler<RemovePhotosFromCollectionCommand, OperationResult<Unit>>, PhotosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdatePhotosCollectionInfoCommand, OperationResult<Unit>>, PhotosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToPhotosCollectionCommand, OperationResult<PhotosCollectionNoteDTO>>, PhotosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddPhotosToCollectionCommand, OperationResult<Unit>>, PhotosCollectionHandlerCommand>();

            // QUERY
            services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<PhotoNoteDTO>, List<PhotoNoteDTO>>, PhotosCollectionHandlerQuery>();

            // FULL NOTE AUDIOS
            services.AddScoped<IRequestHandler<RemoveAudiosFromCollectionCommand, OperationResult<Unit>>, AudiosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateAudiosCollectionInfoCommand, OperationResult<Unit>>, AudiosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToAudiosCollectionCommand, OperationResult<AudiosCollectionNoteDTO>>, AudiosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddAudiosToCollectionCommand, OperationResult<Unit>>, AudiosCollectionHandlerCommand>();

            // QUERY
            services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<AudioNoteDTO>, List<AudioNoteDTO>>, AudiosCollectionHandlerQuery>();

            // FULL NOTE VIDEOS
            services.AddScoped<IRequestHandler<RemoveVideosFromCollectionCommand, OperationResult<Unit>>, VideosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>, VideosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddVideosToCollectionCommand, OperationResult<Unit>>, VideosCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateVideosCollectionInfoCommand, OperationResult<Unit>>, VideosCollectionHandlerCommand>();

            // QUERY
            services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<VideoNoteDTO>, List<VideoNoteDTO>>, VideosCollectionHandlerQuery>();

            // FULL NOTE DOCUMENTS
            services.AddScoped<IRequestHandler<RemoveDocumentsFromCollectionCommand, OperationResult<Unit>>, DocumentsCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<TransformToDocumentsCollectionCommand, OperationResult<DocumentsCollectionNoteDTO>>, DocumentsCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<AddDocumentsToCollectionCommand, OperationResult<Unit>>, DocumentsCollectionHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateDocumentsCollectionInfoCommand, OperationResult<Unit>>, DocumentsCollectionHandlerCommand>();

            // QUERY
            services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<DocumentNoteDTO>, List<DocumentNoteDTO>>, DocumentsCollectionHandlerQuery>();

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
            services.AddScoped<IRequestHandler<GetFullFolderQuery, OperationResult<FullFolder>>, FolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetAdditionalContentFolderInfoQuery, List<BottomFolderContent>>, FolderHandlerQuery>();

            // FULL-FOLDER
            services.AddScoped<IRequestHandler<UpdateTitleFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<AddNotesToFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveNotesFromFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateNotesPositionsInFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();

            services.AddScoped<IRequestHandler<GetFolderNotesByFolderIdQuery, List<SmallNote>>, FullFolderHandlerQuery>();

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

            services.AddScoped<IRequestHandler<RemoveAllUsersFromNoteCommand, OperationResult<Unit>>, SharingHandlerCommand>();
            services.AddScoped<IRequestHandler<RemoveAllUsersFromFolderCommand, OperationResult<Unit>>, SharingHandlerCommand>();

            //LOCK
            services.ApplyEncryptionDI();

            // HISTORY
            services.ApplyHistorysDI();

            // SEARCH
            services.ApplySearchDI();

            //Files
            services.ApplyStorageDI();

            // Permissions
            services.ApplyPermissionsDI();

            // Personalizations
            services.AddScoped<IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>, PersonalizationHandlerQuery>();
            services.AddScoped<IRequestHandler<UpdatePersonalizationSettingsCommand, Unit>, PersonalizationHandlerCommand>();
        }

        public static void SetupLogger(this IServiceCollection services, IConfiguration configuration, string environment)
        {
            var elasticConnString = configuration["ElasticConfiguration:Uri"];
            Log.Logger = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .WriteTo.Debug()
                .WriteTo.Console()
                .WriteTo.Elasticsearch(ConfigureElasticSink(elasticConnString, environment))
                .Enrich.WithProperty("Environment", environment)
                .ReadFrom.Configuration(configuration)
                .CreateLogger();
        }

        private static ElasticsearchSinkOptions ConfigureElasticSink(string elasticConnString, string environment)
        {
            return new ElasticsearchSinkOptions(new Uri(elasticConnString))
            {
                AutoRegisterTemplate = true,
                IndexFormat = $"NOOTS-API-{environment?.ToUpper().Replace(".", "-")}-{DateTime.UtcNow:yyyy-MM-dd}"
            };
        }


        public static void TimersConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            var configService = Configuration.GetSection("Timers").Get<TimersConfig>();
            services.AddSingleton(x => configService);

            var unlockConfig = Configuration.GetSection("UnlockConfig").Get<UnlockConfig>();
            services.AddSingleton(x => unlockConfig);
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
            services.AddScoped<DiffsMatchPatchService>();

            services.AddScoped<CollectionLinkedService>();

            services.AddSingleton<WebsocketsNotesServiceStorage>();
            services.AddSingleton<WebsocketsFoldersServiceStorage>();
        }
    }
}
