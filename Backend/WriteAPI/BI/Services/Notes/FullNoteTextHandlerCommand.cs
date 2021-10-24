using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using BI.Services.History;
using BI.SignalR;
using Common.DTO;
using Domain.Commands.NoteInner.FileContent.Texts;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;

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


        public FullNoteTextHandlerCommand(
            IMediator _mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            AppCustomMapper appCustomMapper,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.appCustomMapper = appCustomMapper;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
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

                var fullNote = await noteRepository.GetFull(note.Id);
                var noteForUpdating = appCustomMapper.MapNoteToFullNote(fullNote);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateGeneralFullNote(noteForUpdating);

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
                var ids = request.Texts.Select(x => x.Id).ToList();
                var contents = await textNotesRepository.GetWhereAsync(x => ids.Contains(x.Id));
                if (contents.Any())
                {
                    foreach(var text in request.Texts)
                    {
                        var textForUpdate = contents.First(x => x.Id == text.Id);

                        textForUpdate.UpdatedAt = DateTimeOffset.Now;
                        textForUpdate.NoteTextTypeId = text.NoteTextTypeId;
                        textForUpdate.HTypeId = text.HeadingTypeId;
                        textForUpdate.Checked = text.Checked;
                        textForUpdate.Content = text.Content;
                        textForUpdate.IsBold = text.IsBold;
                        textForUpdate.IsItalic = text.IsItalic; 
                    }

                    // UPDATING
                    await textNotesRepository.UpdateRangeAsync(contents);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    // TODO DEADLOCK
                    return new OperationResult<Unit>(success: true, Unit.Value);
                }
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
