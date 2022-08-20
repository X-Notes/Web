using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;
using Noots.Permissions.Queries;
using Noots.RelatedNotes.Commands;
using Noots.SignalrUpdater.Impl;
using WriteContext.Repositories.Notes;

namespace Noots.RelatedNotes.Handlers.Commands;

public class ChangeOrderRelatedNotesCommandHandler : IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>
{
    private readonly IMediator _mediator;
    
    private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
    
    private readonly AppSignalRService appSignalRService;
    
    public ChangeOrderRelatedNotesCommandHandler(
        IMediator mediator, 
        ReletatedNoteToInnerNoteRepository relatedRepository, 
        AppSignalRService appSignalRService)
    {
        _mediator = mediator;
        this.relatedRepository = relatedRepository;
        this.appSignalRService = appSignalRService;
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
                    await appSignalRService.UpdateRelatedNotes(request.NoteId, request.UserId, updates);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        return new OperationResult<Unit>(false, Unit.Value);

    }
}