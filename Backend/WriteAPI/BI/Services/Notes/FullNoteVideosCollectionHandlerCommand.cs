using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Notes;
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
    public class FullNoteVideosCollectionHandlerCommand :
        IRequestHandler<RemoveVideosCollectionCommand, OperationResult<Unit>>,
        IRequestHandler<TransformToVideosCollectionCommand, OperationResult<VideosCollectionNoteDTO>>,
        IRequestHandler<UploadVideosToCollectionCommands, OperationResult<List<VideoNoteDTO>>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly FileRepository fileRepository;

        private readonly VideosCollectionNoteRepository videoNoteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteVideosCollectionHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            VideosCollectionNoteRepository videoNoteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService)
        {
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
            this.videoNoteRepository = videoNoteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
        }


        public async Task<OperationResult<Unit>> Handle(RemoveVideosCollectionCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId) as VideosCollectionNote;
                contents.Remove(contentForRemove);

                var orders = Enumerable.Range(1, contents.Count);
                contents = contents.Zip(orders, (content, order) =>
                {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);
                    await baseNoteContentRepository.UpdateRangeAsync(contents);

                    await transaction.CommitAsync();

                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), contentForRemove.Videos));

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
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
                var videoCollection = await baseNoteContentRepository.GetContentByIdAsync<VideosCollectionNote>(request.ContentId);
                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await fileRepository.AddRangeAsync(dbFiles);

                    videoCollection.Videos.AddRange(dbFiles);
                    videoCollection.UpdatedAt = DateTimeOffset.Now;

                    await videoNoteRepository.UpdateAsync(videoCollection);

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
