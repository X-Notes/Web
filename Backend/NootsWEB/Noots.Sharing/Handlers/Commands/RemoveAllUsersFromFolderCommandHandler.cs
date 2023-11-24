using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Notifications.Services;
using Permissions.Impl;
using Permissions.Queries;
using Sharing.Commands.Folders;
using SignalrUpdater.Impl;

namespace Sharing.Handlers.Commands;

public class RemoveAllUsersFromFolderCommandHandler : IRequestHandler<RemoveAllUsersFromFolderCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;
    private readonly NotificationService notificationService;

    public RemoveAllUsersFromFolderCommandHandler(
        IMediator _mediator, 
        AppSignalRService appSignalRHub,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService,
        NotificationService notificationService)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
        this.notificationService = notificationService;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveAllUsersFromFolderCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var userIds = await usersOnPrivateFoldersService.RevokeAllPermissionsFolder(request.FolderId);

            foreach (var userId in userIds)
            {
                var updateCommand = new UpdatePermissionFolderWS();
                updateCommand.RevokeIds.Add(request.FolderId);
                await appSignalRHub.UpdatePermissionUserFolder(updateCommand, userId);
            }

            var metadata = new NotificationMetadata { FolderId = request.FolderId, Title = permissions.Folder.Title };
            await notificationService.AddAndSendNotificationsAsync(permissions.Caller.Id, userIds, NotificationMessagesEnum.RemoveUserFromFolderV1, metadata);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}