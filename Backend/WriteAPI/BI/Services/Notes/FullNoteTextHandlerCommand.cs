using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using BI.Services.History;
using BI.SignalR;
using Common;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.NoteInner.FileContent.Texts;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.Services.Notes
{
    public class FullNoteTextHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateTextContentsCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly NoteRepository noteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppCustomMapper appCustomMapper;

        private readonly AppSignalRService appSignalRService;

        private readonly TextNotesRepository textNotesRepository;

        private readonly UserRepository userRepository;

        private readonly NoteWSUpdateService noteWSUpdateService;

        public FullNoteTextHandlerCommand(
            IMediator _mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            AppCustomMapper appCustomMapper,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository,
            UserRepository userRepository,
            NoteWSUpdateService noteWSUpdateService)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.appCustomMapper = appCustomMapper;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.userRepository = userRepository;
            this.noteWSUpdateService = noteWSUpdateService;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;
                note.Title = request.Title;
                note.UpdatedAt = DateTimeProvider.Time;
                await noteRepository.UpdateAsync(note);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                // WS UPDATES
                await noteWSUpdateService.UpdateNote(new UpdateNoteWS { Title = note.Title, NoteId = note.Id }, permissions.GetAllUsers());

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
                if(request.Texts.Count == 1)
                {
                    await UpdateOne(request.Texts.First(), request.NoteId, permissions.Caller.Email);
                }
                else
                {
                    foreach (var text in request.Texts)
                    {
                        await UpdateOne(text, request.NoteId, permissions.Caller.Email);
                    }
                }

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id, permissions.Author.Email);

                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }


        private async Task UpdateOne(TextNoteDTO text, Guid noteId, string email)
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

                var updates = new UpdateTextWS(text);
                await appSignalRService.UpdateTextContent(noteId, email, updates);
            }
        }
    }
}
