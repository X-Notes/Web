using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Folders;
using Noots.SignalrUpdater.Impl;

namespace Noots.Sharing.Handlers.Commands;

public class RemoveAllUsersFromFolderCommandHandler : IRequestHandler<RemoveAllUsersFromFolderCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public RemoveAllUsersFromFolderCommandHandler(
        IMediator _mediator, 
        AppSignalRService appSignalRHub,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveAllUsersFromFolderCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var ents = await usersOnPrivateFoldersRepository.GetWhereAsync(x => x.FolderId == request.FolderId);
            await usersOnPrivateFoldersRepository.RemoveRangeAsync(ents);

            foreach (var en in ents)
            {
                var updateCommand = new UpdatePermissionFolderWS();
                updateCommand.RevokeIds.Add(request.FolderId);
                await appSignalRHub.UpdatePermissionUserFolder(updateCommand, en.UserId);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}