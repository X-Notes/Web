using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Notes;
using Noots.SignalrUpdater.Impl;

namespace Noots.Sharing.Handlers.Commands;

public class RemoveAllUsersFromNoteCommandHandler : IRequestHandler<RemoveAllUsersFromNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly AppSignalRService appSignalRHub;

    public RemoveAllUsersFromNoteCommandHandler(
        IMediator _mediator, 
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
        AppSignalRService appSignalRHub)
    {
        mediator = _mediator;
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        this.appSignalRHub = appSignalRHub;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveAllUsersFromNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var ents = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
            await usersOnPrivateNotesRepository.RemoveRangeAsync(ents);

            foreach (var en in ents)
            {
                var updateCommand = new UpdatePermissionNoteWS();
                updateCommand.RevokeIds.Add(request.NoteId);
                await appSignalRHub.UpdatePermissionUserNote(updateCommand, en.UserId);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}