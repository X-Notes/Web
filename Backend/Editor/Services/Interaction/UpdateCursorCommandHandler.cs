using Common.DTO;
using MediatR;
using Permissions.Queries;
using SignalrUpdater.Entities;
using SignalrUpdater.Impl;

namespace Editor.Services.Interaction;

public class UpdateCursorCommandHandler : IRequestHandler<UpdateCursorCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NoteWSUpdateService noteWsUpdateService;
    private readonly NotesMultipleUpdateService notesMultipleUpdateService;

    public UpdateCursorCommandHandler(
        IMediator mediator, 
        AppSignalRService appSignalRHub, 
        NoteWSUpdateService noteWsUpdateService,
        NotesMultipleUpdateService notesMultipleUpdateService)
    {
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.noteWsUpdateService = noteWsUpdateService;
        this.notesMultipleUpdateService = notesMultipleUpdateService;
    }

    public async Task<OperationResult<Unit>> Handle(UpdateCursorCommand request, CancellationToken cancellationToken)
    {
        if (request.Cursor == null) return new OperationResult<Unit>().SetAnotherError();

        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (!permissions.CanRead) return new OperationResult<Unit>().SetNoPermissions();

        var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);
        
        if (noteStatus.IsShared)
        {
            var cursor = request.Cursor;
            var updates = new UpdateCursorWS(
                cursor.EntityId,
                (CursorTypeWS)cursor.Type,
                cursor.StartCursor,
                cursor.EndCursor,
                cursor.Color,
                cursor.ItemId,
                request.NoteId,
                permissions.CallerId);

            var connections = await noteWsUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
            await appSignalRHub.UpdateUserNoteCursor(updates, connections);
        }

        return new OperationResult<Unit>(true, Unit.Value);
    }
}
