using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;
using Noots.Permissions.Queries;
using Noots.RelatedNotes.Commands;
using Noots.SignalrUpdater.Impl;
using WriteContext.Repositories.Notes;

namespace Noots.RelatedNotes.Handlers.Commands;

public class UpdateRelatedNotesToNoteCommandHandler : IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<UpdateRelatedNotesWS>>
{
    private readonly IMediator _mediator;
    
    private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
    
    private readonly AppSignalRService appSignalRService;
    
    public UpdateRelatedNotesToNoteCommandHandler(
        IMediator mediator, 
        ReletatedNoteToInnerNoteRepository relatedRepository, 
        AppSignalRService appSignalRService)
    {
        _mediator = mediator;
        this.relatedRepository = relatedRepository;
        this.appSignalRService = appSignalRService;
    }
    
    public async Task<OperationResult<UpdateRelatedNotesWS>> Handle(UpdateRelatedNotesToNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await _mediator.Send(command);

        if (permissions.CanWrite)
        {
            var dbValues = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
            var dbRelatedIds = dbValues.Select(x => x.RelatedNoteId).ToHashSet();

            var valuesToRemove = dbValues.Where(x => !request.RelatedNoteIds.Contains(x.RelatedNoteId));
            var relatedToRemoveIds = valuesToRemove.Select(x => x.RelatedNoteId).ToList();
            if (valuesToRemove.Any())
            {
                await relatedRepository.RemoveRangeAsync(valuesToRemove);
            }

            var idsToAdd = request.RelatedNoteIds.Where(id => !dbRelatedIds.Contains(id)).ToList();
            var valuesToAdd = idsToAdd.Select(relatedId => new ReletatedNoteToInnerNote()
            {
                NoteId = request.NoteId,
                RelatedNoteId = relatedId,
            });

            if (valuesToAdd.Any())
            {
                await relatedRepository.AddRangeAsync(valuesToAdd);
            }

            var updates = new UpdateRelatedNotesWS(request.NoteId) { IdsToRemove = relatedToRemoveIds, IdsToAdd = idsToAdd };
            if (permissions.IsMultiplyUpdate)
            {
                await appSignalRService.UpdateRelatedNotes(request.NoteId, request.UserId, updates);
            }

            return new OperationResult<UpdateRelatedNotesWS>(true, updates);
        }
        return new OperationResult<UpdateRelatedNotesWS>(false, null);
    }
}