using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.Permissions.Impl;
using Noots.Permissions.Queries;
using Notifications.Services;
using Sharing.Commands.Folders;
using SignalrUpdater.Impl;

namespace Sharing.Handlers.Commands;

public class RemoveUserFromPrivateFoldersHandler : IRequestHandler<RemoveUserFromPrivateFolders, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;

    public RemoveUserFromPrivateFoldersHandler(
        IMediator mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService)
    {
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveUserFromPrivateFolders request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var isRevoked = await usersOnPrivateFoldersService.RevokePermissionsFolders(request.PermissionUserId, new List<Guid> { request.FolderId });
            if (isRevoked)
            {
                var updateCommand = new UpdatePermissionFolderWS();
                updateCommand.RevokeIds.Add(request.FolderId);
                await appSignalRHub.UpdatePermissionUserFolder(updateCommand, request.PermissionUserId);

                var metadata = new NotificationMetadata { FolderId = request.FolderId, Title = permissions.Folder.Title };
                await notificationService.AddAndSendNotification(permissions.Caller.Id, request.PermissionUserId, NotificationMessagesEnum.RemoveUserFromFolderV1, metadata);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}