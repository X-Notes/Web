using Common;
using Common.DTO;
using Common.DTO.WebSockets;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Editor.Commands;
using Noots.History.Impl;
using Noots.Permissions.Queries;
using Noots.RGA_CRDT;
using Noots.SignalrUpdater.Impl;

namespace Noots.Editor.Handlers
{
    public class UpdateTitleCommandHandler : IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>
    {
        private readonly IMediator _mediator;

        private readonly NoteRepository noteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly NoteWSUpdateService noteWSUpdateService;

        public UpdateTitleCommandHandler(
            IMediator _mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            NoteWSUpdateService noteWSUpdateService)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.noteWSUpdateService = noteWSUpdateService;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;

                async Task UpdateNoteTitle(List<MergeTransaction<string>> transactions)
                {
                    var title = note.GetTitle() ?? new TreeRGA<string>();
                    title.Merge(transactions.ToArray());
                    note.SetTitle(title);

                    note.UpdatedAt = DateTimeProvider.Time;
                    await noteRepository.UpdateAsync(note);

                    await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);
                }

                if (permissions.IsSingleUpdate)
                {
                    await UpdateNoteTitle(request.Transactions);
                    return new OperationResult<Unit>(true, Unit.Value);
                }

                await UpdateNoteTitle(request.Transactions);

                // WS UPDATES
                var updateCommand = new UpdateNoteWS { TitleTransactions = request.Transactions, NoteId = note.Id, IsUpdateTitle = true };
                await noteWSUpdateService.UpdateNote(updateCommand, permissions.GetAllUsers(), request.UserId);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
