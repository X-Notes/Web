using Common;
using Common.DTO;
using Common.DTO.WebSockets;
using MediatR;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.History.Impl;
using Noots.Notes.Commands;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;

namespace Noots.Notes.Handlers.Commands;

public class RemoveLabelFromNoteCommandHandler : IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly NoteRepository noteRepository;
    private readonly NoteWSUpdateService noteWsUpdateService;
    private readonly HistoryCacheService historyCacheService;

    public RemoveLabelFromNoteCommandHandler(
        IMediator _mediator, 
        LabelsNotesRepository labelsNotesRepository,
        NoteRepository noteRepository,
        NoteWSUpdateService noteWSUpdateService,
        HistoryCacheService historyCacheService)
    {
        mediator = _mediator;
        this.labelsNotesRepository = labelsNotesRepository;
        this.noteRepository = noteRepository;
        noteWsUpdateService = noteWSUpdateService;
        this.historyCacheService = historyCacheService;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
        var permissions = await mediator.Send(command);

        var isAuthor = permissions.All(x => x.perm.IsOwner);
        if (isAuthor)
        {
            var noteIds = permissions.Select(x => x.noteId);
            var notes = permissions.Select(x => x.perm.Note).ToList();
            var values = await labelsNotesRepository.GetWhereAsync(x => x.LabelId == request.LabelId && noteIds.Contains(x.NoteId));

            if (values.Any())
            {
                await labelsNotesRepository.RemoveRangeAsync(values);

                notes.ForEach(x => x.UpdatedAt = DateTimeProvider.Time);
                await noteRepository.UpdateRangeAsync(notes);

                foreach (var perm in permissions)
                {
                    await historyCacheService.UpdateNote(perm.perm.Note.Id, perm.perm.Caller.Id);
                }

                // WS UPDATES
                var updates = permissions.Select(x => 
                    (new UpdateNoteWS { RemoveLabelIds = new List<Guid> { request.LabelId }, NoteId = x.noteId },
                        x.perm.GetAllUsers()));

                await noteWsUpdateService.UpdateNotes(updates, request.UserId);
            }
            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}