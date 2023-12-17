using Billing.Impl;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Permissions.Queries;
using RelatedNotes.Commands;
using SignalrUpdater.Impl;

namespace RelatedNotes.Handlers.Commands;

public class UpdateRelatedNotesToNoteCommandHandler : IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<UpdateRelatedNotesWS>>
{
    private readonly IMediator mediator;
    private readonly RelatedNoteToInnerNoteRepository relatedRepository;
    private readonly AppSignalRService appSignalRService;
    private readonly BillingPermissionService billingPermissionService;
    private readonly NoteWSUpdateService noteWSUpdateService;
    private readonly NotesMultipleUpdateService notesMultipleUpdateService;

    public UpdateRelatedNotesToNoteCommandHandler(
        IMediator mediator, 
        RelatedNoteToInnerNoteRepository relatedRepository, 
        AppSignalRService appSignalRService,
        BillingPermissionService billingPermissionService,
        NoteWSUpdateService noteWSUpdateService,
        NotesMultipleUpdateService notesMultipleUpdateService)
    {
        this.mediator = mediator;
        this.relatedRepository = relatedRepository;
        this.appSignalRService = appSignalRService;
        this.billingPermissionService = billingPermissionService;
        this.noteWSUpdateService = noteWSUpdateService;
        this.notesMultipleUpdateService = notesMultipleUpdateService;
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
        var valuesToRemove = dbValues.Where(x => !request.RelatedNoteIds.Contains(x.RelatedNoteId)).ToList();
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
        }).ToList();
        
        if (valuesToAdd.Any())
        {
            await relatedRepository.AddRangeAsync(valuesToAdd);
        }
            
        // WS
        var noteShareStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(request.NoteId);
        
        var relatedToRemoveIds = valuesToRemove.Select(x => x.RelatedNoteId).ToList();
        var updates = new UpdateRelatedNotesWS(request.NoteId) { IdsToRemove = relatedToRemoveIds, IdsToAdd = idsToAdd };
        if (noteShareStatus.IsShared)
        {
            var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteShareStatus.UserIds, request.ConnectionId);
            await appSignalRService.UpdateRelatedNotes(updates, connections);
        }

        return new OperationResult<UpdateRelatedNotesWS>(true, updates);    
    }
}