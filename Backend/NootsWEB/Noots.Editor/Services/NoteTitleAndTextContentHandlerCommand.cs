using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
using MediatR;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Editor.Commands.Text;
using Noots.Editor.Commands.Title;
using Noots.Editor.Entities;
using Noots.History.Impl;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;

namespace Noots.Editor.Services
{
    public class NoteTitleAndTextContentHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateTextContentsCommand, OperationResult<List<UpdateBaseContentResult>>>
    {

        private readonly IMediator _mediator;

        private readonly NoteRepository noteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly TextNotesRepository textNotesRepository;

        private readonly NoteWSUpdateService noteWSUpdateService;

        private readonly NoteFolderLabelMapper mapper;

        public NoteTitleAndTextContentHandlerCommand(
            IMediator _mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository,
            NoteWSUpdateService noteWSUpdateService,
            NoteFolderLabelMapper mapper)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.noteWSUpdateService = noteWSUpdateService;
            this.mapper = mapper;
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

                await UpdateNoteTitle(request.Title);

                // WS UPDATES
                var update = new UpdateNoteWS { Title = note.Title, NoteId = note.Id, IsUpdateTitle = true };
                await noteWSUpdateService.UpdateNote(update, permissions.GetAllUsers(), request.UserId);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<List<UpdateBaseContentResult>>> Handle(UpdateTextContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (!permissions.CanWrite)
            {
                new OperationResult<Unit>().SetNoPermissions();
            }

            List<UpdateBaseContentResult> results = new();

            foreach (var text in request.Texts)
            {
                var res = await UpdateOne(text, request.NoteId, permissions.Caller.Id, permissions.IsMultiplyUpdate);
                results.Add(res);
            }

            await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

            return new OperationResult<List<UpdateBaseContentResult>>(success: true, results);
        }

        private async Task<UpdateBaseContentResult> UpdateOne(TextDiff text, Guid noteId, Guid userId, bool isMultiplyUpdate)
        {
            var textForUpdate = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == text.Id);
            if (textForUpdate == null) return null;

            textForUpdate.SetDateAndVersion();
            textForUpdate.NoteTextTypeId = text.NoteTextTypeId;
            textForUpdate.HTypeId = text.HeadingTypeId;
            textForUpdate.Checked = text.Checked;
            textForUpdate.Contents = text.Contents;

            await textNotesRepository.UpdateAsync(textForUpdate);

            if (isMultiplyUpdate)
            {
                var updates = new UpdateTextWS(mapper.ToTextDTO(textForUpdate));
                await appSignalRService.UpdateTextContent(noteId, userId, updates);
            }

            return new UpdateBaseContentResult(textForUpdate.Id, textForUpdate.Version, textForUpdate.UpdatedAt);
        }
    }
}
