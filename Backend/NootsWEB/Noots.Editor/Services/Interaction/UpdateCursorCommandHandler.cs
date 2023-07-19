using Common.DTO;
using MediatR;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Entities;
using Noots.SignalrUpdater.Impl;

namespace Noots.Editor.Services.Interaction;

public class UpdateCursorCommandHandler : IRequestHandler<UpdateCursorCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NoteWSUpdateService noteWSUpdateService;

    public UpdateCursorCommandHandler(IMediator _mediator, AppSignalRService appSignalRHub, NoteWSUpdateService noteWSUpdateService)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.noteWSUpdateService = noteWSUpdateService;
    }

    public async Task<OperationResult<Unit>> Handle(UpdateCursorCommand request, CancellationToken cancellationToken)
    {
        if (request.Cursor == null) return new OperationResult<Unit>().SetAnotherError();

        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (!permissions.CanRead) return new OperationResult<Unit>().SetNoPermissions();

        if (permissions.IsMultiplyUpdate)
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
                permissions.Caller.Id);

            var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
            await appSignalRHub.UpdateUserNoteCursor(updates, connections);
        }

        return new OperationResult<Unit>(true, Unit.Value);
    }
}
