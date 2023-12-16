using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using DatabaseContext.Repositories.Folders;
using MediatR;
using Notifications.Services;
using Permissions.Queries;
using Permissions.Services;
using Sharing.Commands.Folders;
using SignalrUpdater.Impl;

namespace Sharing.Handlers.Commands;

public class RemoveUserFromPrivateFoldersHandler : IRequestHandler<RemoveUserFromPrivateFolders, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;
    private readonly FolderRepository folderRepository;

    public RemoveUserFromPrivateFoldersHandler(
        IMediator mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService,
        FolderRepository folderRepository)
    {
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
        this.folderRepository = folderRepository;
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

                var folder = await folderRepository.FirstOrDefaultAsync(x => x.Id == request.FolderId);
                var metadata = new NotificationMetadata { FolderId = request.FolderId, Title = folder.Title };
                await notificationService.AddAndSendNotification(permissions.CallerId, request.PermissionUserId, NotificationMessagesEnum.RemoveUserFromFolderV1, metadata);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}