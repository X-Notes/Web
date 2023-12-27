using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.DTO.Notes.FullNoteSyncContents;
using Editor.Commands.Audios;
using Editor.Commands.Documents;
using Editor.Commands.Files;
using Editor.Commands.Photos;
using Editor.Commands.Structure;
using Editor.Commands.Sync;
using Editor.Commands.Text;
using Editor.Commands.Title;
using Editor.Commands.Videos;
using Editor.Entities;
using Editor.Queries;
using Editor.Services;
using Editor.Services.Audios;
using Editor.Services.Documents;
using Editor.Services.Interaction;
using Editor.Services.Photos;
using Editor.Services.Sync;
using Editor.Services.Sync.Entities;
using Editor.Services.Videos;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Editor;

public static class EditorModules
{
    public static void ApplyEditorModulesDI(this IServiceCollection services)
    {
        // FULL NOTE TEXT
        services.AddScoped<IRequestHandler<UpdateTitleNoteCommand, OperationResult<VersionUpdateResult>>, NoteTitleAndTextContentCommandHandler>();
        services.AddScoped<IRequestHandler<UpdateTextContentsCommand, OperationResult<List<UpdateBaseContentResult>>>, NoteTitleAndTextContentCommandHandler>();

        // FULL NOTE CONTENT
        services.AddScoped<IRequestHandler<SyncNoteStructureCommand, OperationResult<NoteStructureResult>>, SyncNoteStructureCommandHandler>();


        // FULL NOTE PHOTOS
        services.AddScoped<IRequestHandler<RemovePhotosFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>, PhotosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<UpdatePhotosCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>, PhotosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<TransformToPhotosCollectionCommand, OperationResult<PhotosCollectionNoteDTO>>, PhotosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<AddPhotosToCollectionCommand, OperationResult<UpdateCollectionContentResult>>, PhotosCollectionHandlerCommand>();

        // QUERY
        services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<PhotoNoteDTO>, List<PhotoNoteDTO>>, PhotosCollectionHandlerQuery>();

        // FULL NOTE AUDIOS
        services.AddScoped<IRequestHandler<RemoveAudiosFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>, AudiosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<UpdateAudiosCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>, AudiosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<TransformToAudiosCollectionCommand, OperationResult<AudiosCollectionNoteDTO>>, AudiosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<AddAudiosToCollectionCommand, OperationResult<UpdateCollectionContentResult>>, AudiosCollectionHandlerCommand>();

        // QUERY
        services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<AudioNoteDTO>, List<AudioNoteDTO>>, AudiosCollectionHandlerQuery>();

        // FULL NOTE VIDEOS
        services.AddScoped<IRequestHandler<RemoveVideosFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>, VideosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>, VideosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<AddVideosToCollectionCommand, OperationResult<UpdateCollectionContentResult>>, VideosCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<UpdateVideosCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>, VideosCollectionHandlerCommand>();

        // QUERY
        services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<VideoNoteDTO>, List<VideoNoteDTO>>, VideosCollectionHandlerQuery>();

        // FULL NOTE DOCUMENTS
        services.AddScoped<IRequestHandler<RemoveDocumentsFromCollectionCommand, OperationResult<UpdateCollectionContentResult>>, DocumentsCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<TransformToDocumentsCollectionCommand, OperationResult<DocumentsCollectionNoteDTO>>, DocumentsCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<AddDocumentsToCollectionCommand, OperationResult<UpdateCollectionContentResult>>, DocumentsCollectionHandlerCommand>();
        services.AddScoped<IRequestHandler<UpdateDocumentsCollectionInfoCommand, OperationResult<UpdateBaseContentResult>>, DocumentsCollectionHandlerCommand>();

        // QUERY
        services.AddScoped<IRequestHandler<GetNoteFilesByIdsQuery<DocumentNoteDTO>, List<DocumentNoteDTO>>, DocumentsCollectionHandlerQuery>();

        // FULL NOTE FILES
        services.AddScoped<IRequestHandler<UploadNoteFilesToStorageCommand, OperationResult<List<AppFile>>>, UploadNoteFilesToStorageCommandHandler>();

        // FULL NOTE CURSOR
        services.AddScoped<IRequestHandler<UpdateCursorCommand, OperationResult<Unit>>, UpdateCursorCommandHandler>();

        // DIFFS
        services.AddScoped<IRequestHandler<SyncEditorStateCommand, OperationResult<SyncStateResult>>, SyncEditorStateCommandHandler>();
    }
}
