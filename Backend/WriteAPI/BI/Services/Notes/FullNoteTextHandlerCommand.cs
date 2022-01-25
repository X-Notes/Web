using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using BI.Services.History;
using BI.SignalR;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets;
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
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;
                note.Title = request.Title;
                note.UpdatedAt = DateTimeOffset.Now;
                await noteRepository.UpdateAsync(note);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                // WS UPDATES
                await noteWSUpdateService.UpdateNote(new UpdateNoteWS { Title = note.Title, NoteId = note.Id }, permissions.GetAllUsers());

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTextContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if(request.Texts.Count == 1)
                {
                    await UpdateOne(request.Texts.First());
                }
                else
                {
                    await UpdateMany(request.Texts);
                }

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                // TODO DEADLOCK
                return new OperationResult<Unit>(success: true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        private async Task UpdateMany(List<TextNoteDTO> texts)
        {
            var ids = texts.Select(x => x.Id).ToList();
            var contents = await textNotesRepository.GetWhereAsync(x => ids.Contains(x.Id));

            foreach (var text in texts)
            {
                var textForUpdate = contents.FirstOrDefault(x => x.Id == text.Id);
                if(textForUpdate != null)
                {
                    textForUpdate.UpdatedAt = DateTimeOffset.Now;
                    textForUpdate.NoteTextTypeId = text.NoteTextTypeId;
                    textForUpdate.HTypeId = text.HeadingTypeId;
                    textForUpdate.Checked = text.Checked;
                    textForUpdate.Contents = text.Contents;
                }
            }
            // UPDATING
            await textNotesRepository.UpdateRangeAsync(contents);
        }

        private async Task UpdateOne(TextNoteDTO text)
        {
            var textForUpdate = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == text.Id);
            if (textForUpdate != null)
            {
                textForUpdate.UpdatedAt = DateTimeOffset.Now;
                textForUpdate.NoteTextTypeId = text.NoteTextTypeId;
                textForUpdate.HTypeId = text.HeadingTypeId;
                textForUpdate.Checked = text.Checked;
                textForUpdate.Contents = text.Contents;
            }
            await textNotesRepository.UpdateAsync(textForUpdate);
        }
    }
}
