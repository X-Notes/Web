using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Permissions.Impl;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Folders;
using Notifications.Services;
using SignalrUpdater.Impl;

namespace Noots.Sharing.Handlers.Commands;

public class SendInvitesToUsersFoldersHandler: IRequestHandler<SendInvitesToUsersFolders, Unit>
{
    private readonly IMediator mediator;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;
    private readonly NotificationService notificationService;
    private readonly AppSignalRService appSignalRHub;

    public SendInvitesToUsersFoldersHandler(
        IMediator _mediator,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService,
        NotificationService notificationService,
        AppSignalRService appSignalRHub)
    {
        mediator = _mediator;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
        this.notificationService = notificationService;
        this.appSignalRHub = appSignalRHub;
    }
    
    public async Task<Unit> Handle(SendInvitesToUsersFolders request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            await usersOnPrivateFoldersService.AddPermissionsAsync(request.FolderId, request.RefTypeId, request.UserIds);

            var updateCommand = new UpdatePermissionFolderWS();
            updateCommand.IdsToAdd.Add(request.FolderId);
            foreach (var userId in request.UserIds)
            {
                await appSignalRHub.UpdatePermissionUserFolder(updateCommand, userId);
            }

            // NOTIFICATIONS
            var metadata = new NotificationMetadata { FolderId = request.FolderId, Title = permissions.Folder.Title };
            await notificationService.AddAndSendNotificationsAsync(permissions.Caller.Id, request.UserIds, NotificationMessagesEnum.SentInvitesToFolderV1, metadata);
        }

        return Unit.Value;
    }
}