using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Permissions.Queries;
using Noots.RelatedNotes.Commands;
using Noots.SignalrUpdater.Impl;

namespace Noots.RelatedNotes.Handlers.Commands;

public class UpdateRelatedNotesToNoteCommandHandler : IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<UpdateRelatedNotesWS>>
{
    private readonly IMediator mediator;
    private readonly RelatedNoteToInnerNoteRepository relatedRepository;
    private readonly AppSignalRService appSignalRService;
    private readonly BillingPermissionService billingPermissionService;
    private readonly NoteWSUpdateService noteWSUpdateService;

    public UpdateRelatedNotesToNoteCommandHandler(
        IMediator mediator, 
        RelatedNoteToInnerNoteRepository relatedRepository, 
        AppSignalRService appSignalRService,
        BillingPermissionService billingPermissionService,
        NoteWSUpdateService noteWSUpdateService)
    {
        this.mediator = mediator;
        this.relatedRepository = relatedRepository;
        this.appSignalRService = appSignalRService;
        this.billingPermissionService = billingPermissionService;
        this.noteWSUpdateService = noteWSUpdateService;
    }
    
    public async Task<OperationResult<UpdateRelatedNotesWS>> Handle(UpdateRelatedNotesToNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (!permissions.CanWrite)
        {
            return new OperationResult<UpdateRelatedNotesWS>().SetNoPermissions();
        }

        var commandNotePermissions = new GetUserPermissionsForNotesManyQuery(request.RelatedNoteIds, request.UserId);
        var notesPermissions = await mediator.Send(commandNotePermissions);
        var noteIdsRead = notesPermissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();

        var userPlan = await billingPermissionService.GetUserPlanAsync(request.UserId);
        if (noteIdsRead.Count > userPlan.MaxRelatedNotes)
        {
            return new OperationResult<UpdateRelatedNotesWS>().SetBillingError();
        }
            
        var dbValues = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
            
        // REMOVE 
        var valuesToRemove = dbValues.Where(x => !request.RelatedNoteIds.Contains(x.RelatedNoteId));
        if (valuesToRemove.Any())
        {
            await relatedRepository.RemoveRangeAsync(valuesToRemove);
        }
            
        // ADD
        var dbRelatedIds = dbValues.Select(x => x.RelatedNoteId).ToHashSet();
        var idsToAdd = noteIdsRead.Where(id => !dbRelatedIds.Contains(id)).ToList();
        var valuesToAdd = idsToAdd.Select(relatedId => new RelatedNoteToInnerNote()
        {
            NoteId = request.NoteId,
            RelatedNoteId = relatedId,
        });
        if (valuesToAdd.Any())
        {
            await relatedRepository.AddRangeAsync(valuesToAdd);
        }
            
        // WS
        var relatedToRemoveIds = valuesToRemove.Select(x => x.RelatedNoteId).ToList();
        var updates = new UpdateRelatedNotesWS(request.NoteId) { IdsToRemove = relatedToRemoveIds, IdsToAdd = idsToAdd };
        if (permissions.IsMultiplyUpdate)
        {
            var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
            await appSignalRService.UpdateRelatedNotes(updates, connections);
        }

        return new OperationResult<UpdateRelatedNotesWS>(true, updates);    
    }
}