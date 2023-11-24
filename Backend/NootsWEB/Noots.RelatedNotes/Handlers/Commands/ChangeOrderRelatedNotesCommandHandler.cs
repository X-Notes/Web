using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Permissions.Queries;
using RelatedNotes.Commands;
using SignalrUpdater.Impl;

namespace RelatedNotes.Handlers.Commands;

public class ChangeOrderRelatedNotesCommandHandler : IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>
{
    private readonly IMediator _mediator;
    
    private readonly RelatedNoteToInnerNoteRepository relatedRepository;
    
    private readonly AppSignalRService appSignalRService;

    private readonly NoteWSUpdateService noteWSUpdateService;

    public ChangeOrderRelatedNotesCommandHandler(
        IMediator mediator, 
        RelatedNoteToInnerNoteRepository relatedRepository, 
        AppSignalRService appSignalRService,
        NoteWSUpdateService noteWSUpdateService)
    {
        _mediator = mediator;
        this.relatedRepository = relatedRepository;
        this.appSignalRService = appSignalRService;
        this.noteWSUpdateService = noteWSUpdateService;
    }
    
    public async Task<OperationResult<Unit>> Handle(ChangeOrderRelatedNotesCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await _mediator.Send(command);
        var note = permissions.Note;

        if (permissions.CanWrite)
        {
            var idsToChange = request.Positions.Select(x => x.EntityId).ToHashSet();
            var currentRelateds = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId && idsToChange.Contains(x.RelatedNoteId));

            if (currentRelateds.Any())
            {
                request.Positions.ForEach(x =>
                {
                    var note = currentRelateds.FirstOrDefault(z => z.RelatedNoteId == x.EntityId);
                    if (note != null)
                    {
                        note.Order = x.Position;
                    }
                });

                await relatedRepository.UpdateRangeAsync(currentRelateds);

                if (permissions.IsMultiplyUpdate)
                {
                    var updates = new UpdateRelatedNotesWS(request.NoteId) { Positions = request.Positions };
                    var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
                    await appSignalRService.UpdateRelatedNotes(updates, connections);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        return new OperationResult<Unit>(false, Unit.Value);

    }
}