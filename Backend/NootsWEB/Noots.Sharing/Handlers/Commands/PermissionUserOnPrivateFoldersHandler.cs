using Common;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Folders;
using Noots.SignalrUpdater.Impl;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notifications;

namespace Noots.Sharing.Handlers.Commands;

public class PermissionUserOnPrivateFoldersHandler : IRequestHandler<PermissionUserOnPrivateFolders, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationRepository notificationRepository;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public PermissionUserOnPrivateFoldersHandler(
        IMediator _mediator, 
        AppSignalRService appSignalRHub,
        NotificationRepository notificationRepository,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationRepository = notificationRepository;
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

            var notification = new Notification() // TODO MOVE TO SERVICE
            {
                UserFromId = permissions.Caller.Id,
                UserToId = request.PermissionUserId,
                TranslateKeyMessage = "notification.ChangeUserPermissionFolder",
                Date = DateTimeProvider.Time
            };

            await notificationRepository.AddAsync(notification);

            var updateCommand = new UpdatePermissionFolderWS();
            updateCommand.UpdatePermission(new UpdatePermissionEntity(access.FolderId, access.AccessTypeId));

            await appSignalRHub.UpdatePermissionUserFolder(updateCommand, request.PermissionUserId);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}