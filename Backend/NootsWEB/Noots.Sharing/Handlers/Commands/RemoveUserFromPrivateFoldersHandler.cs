using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Notifications.Services;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Folders;
using Noots.SignalrUpdater.Impl;

namespace Noots.Sharing.Handlers.Commands;

public class RemoveUserFromPrivateFoldersHandler : IRequestHandler<RemoveUserFromPrivateFolders, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public RemoveUserFromPrivateFoldersHandler(
        IMediator mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
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