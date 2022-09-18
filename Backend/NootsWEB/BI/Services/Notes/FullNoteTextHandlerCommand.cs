using System;
using System.Threading;
using System.Threading.Tasks;
using BI.Services.DiffsMatchPatch;
using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.NoteInner.FileContent.Texts;
using MediatR;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.History.Impl;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;

namespace BI.Services.Notes
{
    public class FullNoteTextHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateTextContentsCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly NoteRepository noteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly TextNotesRepository textNotesRepository;

        private readonly NoteWSUpdateService noteWSUpdateService;
        
        private readonly DiffsMatchPatchService diffsMatchPatchService;

        public FullNoteTextHandlerCommand(
            IMediator _mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository,
            NoteWSUpdateService noteWSUpdateService,
            DiffsMatchPatchService diffsMatchPatchService)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.noteWSUpdateService = noteWSUpdateService;
            this.diffsMatchPatchService = diffsMatchPatchService;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command);

           if (permissions.CanWrite)
            {
                var note = permissions.Note;

                async Task UpdateNoteTitle(string title)
                {
                    note.Title = title;
                    note.UpdatedAt = DateTimeProvider.Time;
                    await noteRepository.UpdateAsync(note);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);
                }

                if (permissions.IsSingleUpdate)
                {
                    await UpdateNoteTitle(request.Title);
                    return new OperationResult<Unit>(true, Unit.Value);
                }

                var title = diffsMatchPatchService.PatchToStr(request.Diffs, note.Title);
                await UpdateNoteTitle(title);

                // WS UPDATES
                await noteWSUpdateService.UpdateNote(new UpdateNoteWS { Title = note.Title, NoteId = note.Id, IsUpdateTitle = true }, permissions.GetAllUsers(), Guid.Empty);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTextContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                foreach (var text in request.Texts)
                {
                    await UpdateOne(text, request.NoteId, permissions.Caller.Id, permissions.IsMultiplyUpdate);
                }

                await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }


        private async Task UpdateOne(TextNoteDTO text, Guid noteId, Guid userId, bool isMultiplyUpdate)
        {
            var textForUpdate = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == text.Id);
            if (textForUpdate != null)
            {
                textForUpdate.UpdatedAt = DateTimeProvider.Time;
                textForUpdate.NoteTextTypeId = text.NoteTextTypeId;
                textForUpdate.HTypeId = text.HeadingTypeId;
                textForUpdate.Checked = text.Checked;
                textForUpdate.Contents = text.Contents;

                await textNotesRepository.UpdateAsync(textForUpdate);

                if (isMultiplyUpdate)
                {
                    var updates = new UpdateTextWS(text);
                    await appSignalRService.UpdateTextContent(noteId, userId, updates);
                }
            }
        }
    }
}
