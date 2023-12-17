using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Permissions.Queries;
using RelatedNotes.Commands;
using SignalrUpdater.Impl;

namespace RelatedNotes.Handlers.Commands;

public class ChangeOrderRelatedNotesCommandHandler : IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    
    private readonly RelatedNoteToInnerNoteRepository relatedRepository;
    
    private readonly AppSignalRService appSignalRService;

    private readonly NoteWSUpdateService noteWsUpdateService;
    private readonly NotesMultipleUpdateService notesMultipleUpdateService;

    public ChangeOrderRelatedNotesCommandHandler(
        IMediator mediator, 
        RelatedNoteToInnerNoteRepository relatedRepository, 
        AppSignalRService appSignalRService,
        NoteWSUpdateService noteWsUpdateService,
        NotesMultipleUpdateService notesMultipleUpdateService)
    {
        this.mediator = mediator;
        this.relatedRepository = relatedRepository;
        this.appSignalRService = appSignalRService;
        this.noteWsUpdateService = noteWsUpdateService;
        this.notesMultipleUpdateService = notesMultipleUpdateService;
    }
    
    public async Task<OperationResult<Unit>> Handle(ChangeOrderRelatedNotesCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command, cancellationToken);

        if (!permissions.CanWrite)
        {
            return new OperationResult<Unit>(false, Unit.Value);
        }

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

            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);
            
            if (noteStatus.IsShared)
            {
                var updates = new UpdateRelatedNotesWS(request.NoteId) { Positions = request.Positions };
                var connections = await noteWsUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
                await appSignalRService.UpdateRelatedNotes(updates, connections);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNotFound();
    }
}