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
    private readonly FolderRepository folderRepository;

    public PermissionUserOnPrivateFoldersHandler(
        IMediator _mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
        FolderRepository folderRepository)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        this.folderRepository = folderRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(PermissionUserOnPrivateFolders request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (!permissions.IsOwner)
        {
            return new OperationResult<Unit>().SetNoPermissions();
        }
        
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

        var folder = await folderRepository.FirstOrDefaultAsync(x => x.Id == request.FolderId);
        var metadata = new NotificationMetadata { FolderId = request.FolderId, Title = folder.Title };
        await notificationService.AddAndSendNotification(permissions.CallerId, request.PermissionUserId, NotificationMessagesEnum.ChangeUserPermissionFolderV1, metadata);

        return new OperationResult<Unit>(true, Unit.Value);
    }
}