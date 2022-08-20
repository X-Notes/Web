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

public class RemoveUserFromPrivateFoldersHandler : IRequestHandler<RemoveUserFromPrivateFolders, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationRepository notificationRepository;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public RemoveUserFromPrivateFoldersHandler(
        IMediator mediator, 
        AppSignalRService appSignalRHub,
        NotificationRepository notificationRepository,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationRepository = notificationRepository;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveUserFromPrivateFolders request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var access = await usersOnPrivateFoldersRepository
                .FirstOrDefaultAsync(x => x.UserId == request.PermissionUserId && x.FolderId == request.FolderId);
            if (access != null)
            {
                await usersOnPrivateFoldersRepository.RemoveAsync(access);

                var notification = new Notification()
                {
                    UserFromId = permissions.Caller.Id,
                    UserToId = request.PermissionUserId,
                    TranslateKeyMessage = "notification.RemoveUserFromFolder",
                    Date = DateTimeProvider.Time
                };

                await notificationRepository.AddAsync(notification);

                var updateCommand = new UpdatePermissionFolderWS();
                updateCommand.RevokeIds.Add(request.FolderId);

                await appSignalRHub.UpdatePermissionUserFolder(updateCommand, request.PermissionUserId);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}