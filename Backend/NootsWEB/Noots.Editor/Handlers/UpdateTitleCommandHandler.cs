using BI.Services.DiffsMatchPatch;
using Common;
using Common.DTO;
using Common.DTO.WebSockets;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Editor.Commands;
using Noots.History.Impl;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;

namespace Noots.Editor.Handlers
{
    public class UpdateTitleCommandHandler : IRequestHandler<UpdateTitleCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly NoteRepository noteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly NoteWSUpdateService noteWSUpdateService;

        private readonly DiffsMatchPatchService diffsMatchPatchService;

        public UpdateTitleCommandHandler(
            IMediator _mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            NoteWSUpdateService noteWSUpdateService,
            DiffsMatchPatchService diffsMatchPatchService)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.noteWSUpdateService = noteWSUpdateService;
            this.diffsMatchPatchService = diffsMatchPatchService;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleCommand request, CancellationToken cancellationToken)
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
    }
}
