using Common.DatabaseModels.Models.Files;
using Common.DTO.Notes.FullNoteContent.Files;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.DTO;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Editor.Services.Audios;
using Noots.Editor.Services.Documents;
using Noots.Editor.Services.Interaction;
using Noots.Editor.Services.Photos;
using Noots.Editor.Services.Videos;
using Noots.Editor.Services;
using Noots.Editor.Commands.Sync;
using Noots.Editor.Services.Sync.Entities;
using Noots.Editor.Services.Sync;
using Noots.Editor.Commands.Structure;
using Noots.Editor.Entities;
using Noots.Editor.Commands.Videos;
using Noots.Editor.Commands.Text;
using Noots.Editor.Commands.Title;
using Noots.Editor.Commands.Photos;
using Noots.Editor.Commands.Files;
using Noots.Editor.Commands.Documents;
using Noots.Editor.Commands.Audios;
using Noots.Editor.Queries;

namespace Noots.Editor;

public static class EditorModules
{
    public static void ApplyEditorModulesDI(this IServiceCollection services)
    {
        // FULL NOTE TEXT
        services.AddScoped<IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>, NoteTitleAndTextContentCommandHandler>();
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
