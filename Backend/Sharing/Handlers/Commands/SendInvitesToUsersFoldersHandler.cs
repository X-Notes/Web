using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO.WebSockets.Permissions;
using DatabaseContext.Repositories.Folders;
using MediatR;
using Notifications.Services;
using Permissions.Impl;
using Permissions.Queries;
using Sharing.Commands.Folders;
using SignalrUpdater.Impl;

namespace Sharing.Handlers.Commands;

public class SendInvitesToUsersFoldersHandler: IRequestHandler<SendInvitesToUsersFolders, Unit>
{
    private readonly IMediator mediator;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;
    private readonly NotificationService notificationService;
    private readonly AppSignalRService appSignalRHub;
    private readonly FolderRepository folderRepository;

    public SendInvitesToUsersFoldersHandler(
        IMediator _mediator,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService,
        NotificationService notificationService,
        AppSignalRService appSignalRHub,
        FolderRepository folderRepository)
    {
        mediator = _mediator;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
        this.notificationService = notificationService;
        this.appSignalRHub = appSignalRHub;
        this.folderRepository = folderRepository;
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
            var folder = await folderRepository.FirstOrDefaultAsync(x => x.Id == request.FolderId);
            var metadata = new NotificationMetadata { FolderId = request.FolderId, Title = folder.Title };
            await notificationService.AddAndSendNotificationsAsync(permissions.CallerId, request.UserIds, NotificationMessagesEnum.SentInvitesToFolderV1, metadata);
        }

        return Unit.Value;
    }
}