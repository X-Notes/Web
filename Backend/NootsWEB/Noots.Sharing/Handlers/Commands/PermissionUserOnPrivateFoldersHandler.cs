using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using DatabaseContext.Repositories.Folders;
using MediatR;
using Notifications.Services;
using Permissions.Queries;
using Sharing.Commands.Folders;
using SignalrUpdater.Impl;

namespace Sharing.Handlers.Commands;

public class PermissionUserOnPrivateFoldersHandler : IRequestHandler<PermissionUserOnPrivateFolders, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public PermissionUserOnPrivateFoldersHandler(
        IMediator _mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(PermissionUserOnPrivateFolders request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var access = await usersOnPrivateFoldersRepository
                .FirstOrDefaultAsync(x => x.UserId == request.PermissionUserId && x.FolderId == request.FolderId);

            if (access == null)
            {
                return new OperationResult<Unit>().SetNotFound();
            }

            access.AccessTypeId = request.AccessTypeId;
            await usersOnPrivateFoldersRepository.UpdateAsync(access);

            var updateCommand = new UpdatePermissionFolderWS();
            updateCommand.UpdatePermission(new UpdatePermissionEntity(access.FolderId, access.AccessTypeId));
            await appSignalRHub.UpdatePermissionUserFolder(updateCommand, request.PermissionUserId);

            var metadata = new NotificationMetadata { FolderId = request.FolderId, Title = permissions.Folder.Title };
            await notificationService.AddAndSendNotification(permissions.Caller.Id, request.PermissionUserId, NotificationMessagesEnum.ChangeUserPermissionFolderV1, metadata);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}