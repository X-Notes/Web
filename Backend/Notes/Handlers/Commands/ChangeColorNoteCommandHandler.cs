using Common.DTO;
using DatabaseContext.Repositories.Notes;
using History.Impl;
using MediatR;
using Notes.Commands;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Notes.Handlers.Commands;

public class ChangeColorNoteCommandHandler(IMediator mediator,
        NoteRepository noteRepository,
        NoteWSUpdateService noteWsUpdateService,
        HistoryCacheService historyCacheService)
    : IRequestHandler<ChangeColorNoteCommand, OperationResult<List<VersionUpdateResult>>>
{
    private readonly NoteWSUpdateService noteWsUpdateService = noteWsUpdateService;

    public async Task<OperationResult<List<VersionUpdateResult>>> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command, cancellationToken);

        var isCanEdit = permissions.All(x => x.perm.CanWrite);
        if (!isCanEdit)
        {
            return new OperationResult<List<VersionUpdateResult>>().SetNoPermissions();
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
        
        var results = notesForUpdate.Select(x => new VersionUpdateResult(x.Id, x.Version)).ToList();
        return new OperationResult<List<VersionUpdateResult>>(true, results);
    }
}