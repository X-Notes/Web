using Common.DTO;
using Common.DTO.WebSockets;
using DatabaseContext.Repositories.Notes;
using History.Impl;
using MediatR;
using Notes.Commands;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Notes.Handlers.Commands;

public class ChangeColorNoteCommandHandler : IRequestHandler<ChangeColorNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly NoteRepository noteRepository;
    private readonly NoteWSUpdateService noteWsUpdateService;
    private readonly HistoryCacheService historyCacheService;

    public ChangeColorNoteCommandHandler(
        IMediator mediator, 
        NoteRepository noteRepository,
        NoteWSUpdateService noteWsUpdateService,
        HistoryCacheService historyCacheService)
    {
        this.mediator = mediator;
        this.noteRepository = noteRepository;
        this.noteWsUpdateService = noteWsUpdateService;
        this.historyCacheService = historyCacheService;
    }
    
    public async Task<OperationResult<Unit>> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command, cancellationToken);

        var isCanEdit = permissions.All(x => x.perm.CanWrite);
        if (!isCanEdit)
        {
            return new OperationResult<Unit>().SetNoPermissions();
        }
        
        var noteIds = permissions.Select(x => x.perm.NoteId);
        var notesForUpdate = await noteRepository.GetWhereAsync(x => noteIds.Contains(x.Id));
        
        foreach(var note in notesForUpdate)
        {
            note.Color = request.Color;
            note.SetDateAndVersion();
        }

        await noteRepository.UpdateRangeAsync(notesForUpdate);

        // HISTORY
        foreach(var perm in permissions)
        {
            await historyCacheService.UpdateNoteAsync(perm.noteId, perm.perm.CallerId);
        }

        /*
            // WS UPDATES
            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);
            
            var updates = permissions
                .Where(x => x.perm.IsMultiplyUpdate)
                .Select(x => ( new UpdateNoteWS { Color = request.Color, NoteId = x.noteId }, x.perm.GetAllUsers()));

            if (updates.Any())
            {
                await noteWsUpdateService.UpdateNotesWithConnections(updates, request.ConnectionId);
            }
        */
        
        return new OperationResult<Unit>(true, Unit.Value);
    }
}