using System;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using BI.Services.History;
using BI.SignalR;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner.FileContent.Texts;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;

namespace BI.Services.Notes
{
    public class FullNoteTextHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateTextNoteCommand, OperationResult<Unit>>,
        IRequestHandler<TransformTextTypeCommand, OperationResult<Unit>>
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
                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                var fullNote = await noteRepository.GetFull(note.Id);

                var noteForUpdating = appCustomMapper.MapNoteToFullNote(fullNote);
                await appSignalRService.UpdateGeneralFullNote(noteForUpdating);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTextNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var content = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                content.Content = request.Content;

                content.Checked = request.Checked ?? content.Checked;
                content.IsBold = request.IsBold.HasValue ? request.IsBold.Value : content.IsBold;
                content.IsItalic = request.IsItalic.HasValue ? request.IsBold.Value : content.IsItalic;

                content.UpdatedAt = DateTimeOffset.Now;
                await textNotesRepository.UpdateAsync(content);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(true, Unit.Value);
                // TODO DEADLOCK
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(TransformTextTypeCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var content = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                if (content != null)
                {
                    content.NoteTextTypeId = request.Type;
                    content.HTypeId = request.HeadingType;
                    content.UpdatedAt = DateTimeOffset.Now;
                    await textNotesRepository.UpdateAsync(content);

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
