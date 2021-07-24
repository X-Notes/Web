using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Videos;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteVideoHandlerCommand :
        IRequestHandler<InsertVideosToNoteCommand, OperationResult<VideoNoteDTO>>,
        IRequestHandler<RemoveVideoCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly FileRepository fileRepository;

        private readonly VideoNoteRepository videoNoteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        public FullNoteVideoHandlerCommand(
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            VideoNoteRepository videoNoteRepository,
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

        public async Task<OperationResult<VideoNoteDTO>> Handle(InsertVideosToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == note.Id);

                var contentForRemove = contents.First(x => x.Id == request.ContentId);

                // FILES LOGIC
                var filebyte = await request.Video.GetFilesBytesAsync();
                var file = await _mediator.Send(new SaveVideosToNoteCommand(permissions.Author.Id, filebyte, note.Id));

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);

                    await fileRepository.AddAsync(file);

                    var videoNote = new VideoNote()
                    {
                        AppFileId = file.Id,
                        Name = request.Video.FileName,
                        Note = note,
                        Order = contentForRemove.Order,
                    };

                    await videoNoteRepository.AddAsync(videoNote);

                    await transaction.CommitAsync();

                    var result = new VideoNoteDTO(videoNote.Name, videoNote.AppFileId, file.PathNonPhotoContent, videoNote.Id, videoNote.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<VideoNoteDTO>(Success: true, result);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), file));
                }
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<VideoNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<Unit>> Handle(RemoveVideoCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId) as VideoNote;
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

                    await _mediator.Send(new RemoveFilesCommand(permissions.User.Id.ToString(), contentForRemove.AppFile));

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }
    }
}
