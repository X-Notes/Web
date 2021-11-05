using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Videos;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteVideosCollectionHandlerCommand : FullNoteBaseCollection,
        IRequestHandler<UnlinkVideosCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<RemoveVideoFromCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>,
        IRequestHandler<UploadVideosToCollectionCommands, OperationResult<List<VideoNoteDTO>>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly VideosCollectionNoteRepository videoNoteRepository;

        private readonly VideoNoteAppFileRepository videoNoteAppFileRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteVideosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            VideosCollectionNoteRepository videoNoteRepository,
            VideoNoteAppFileRepository videoNoteAppFileRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService) : base(appFileUploadInfoRepository, fileRepository)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.videoNoteRepository = videoNoteRepository;
            this.videoNoteAppFileRepository = videoNoteAppFileRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }


        public async Task<OperationResult<Unit>> Handle(UnlinkVideosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var videos = await videoNoteAppFileRepository.GetWhereAsync(x => x.VideosCollectionNoteId == request.ContentId);
                var ids = videos.Select(x => x.AppFileId).ToArray();

                await MarkAsUnlinked(ids);

                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveVideoFromCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var collection = await videoNoteRepository.GetOneIncludeVideoNoteAppFiles(request.ContentId);
                collection.VideoNoteAppFiles = collection.VideoNoteAppFiles.Where(x => x.AppFileId != request.VideoId).ToList();
                collection.UpdatedAt = DateTimeOffset.Now;

                await videoNoteRepository.UpdateAsync(collection);
                await MarkAsUnlinked(request.VideoId);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<VideosCollectionNoteDTO>> Handle(TransformToVideosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var contentForRemove = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);

                if (contentForRemove == null)
                {
                    throw new Exception("Content not found");
                }


                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    var videoNote = new VideosCollectionNote()
                    {
                        NoteId = request.NoteId,
                        Order = contentForRemove.Order,
                    };

                    await videoNoteRepository.AddAsync(videoNote);

                    await transaction.CommitAsync();

                    var result = new VideosCollectionNoteDTO(videoNote.Id, videoNote.Order, videoNote.UpdatedAt, videoNote.Name, null);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<VideosCollectionNoteDTO>(success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<VideosCollectionNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<List<VideoNoteDTO>>> Handle(UploadVideosToCollectionCommands request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                // PERMISSION MEMORY
                var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.Videos.Sum(x => x.Length), permissions.Author.Id));
                if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
                {
                    return new OperationResult<List<VideoNoteDTO>>().SetNoEnougnMemory();
                }

                // FILE LOGIC
                var filebytes = await request.Videos.GetFilesBytesAsync();
                var dbFiles = await _mediator.Send(new SaveVideosToNoteCommand(permissions.Author.Id, filebytes, note.Id));

                if (cancellationToken.IsCancellationRequested)
                {
                    var pathes = dbFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
                    await _mediator.Send(new RemoveFilesFromStorageCommand(pathes, permissions.Author.Id.ToString()));
                    return new OperationResult<List<VideoNoteDTO>>().SetRequestCancelled();
                }

                // UPDATING
                var videoCollection = await videoNoteRepository.GetOneIncludeVideos(request.ContentId);
                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    videoCollection.Videos.AddRange(dbFiles);
                    videoCollection.UpdatedAt = DateTimeOffset.Now;

                    await videoNoteRepository.UpdateAsync(videoCollection);

                    await MarkAsLinked(dbFiles);

                    await transaction.CommitAsync();

                    var videos = dbFiles.Select(x => new VideoNoteDTO(x.Name, x.Id, x.PathNonPhotoContent, x.UserId)).ToList();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<List<VideoNoteDTO>>(success: true, videos);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), dbFiles));
                }
            }

            return new OperationResult<List<VideoNoteDTO>>().SetNoPermissions();
        }
    }
}
