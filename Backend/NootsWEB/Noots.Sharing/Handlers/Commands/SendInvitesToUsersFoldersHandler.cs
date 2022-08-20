using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Users;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Folders;
using Noots.SignalrUpdater.Impl;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notifications;

namespace Noots.Sharing.Handlers.Commands;

public class SendInvitesToUsersFoldersHandler: IRequestHandler<SendInvitesToUsersFolders, Unit>
{
    private readonly IMediator mediator;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
    private readonly NotificationRepository notificationRepository;
    private readonly AppSignalRService appSignalRHub;

    public SendInvitesToUsersFoldersHandler(
        IMediator _mediator, 
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
        NotificationRepository notificationRepository,
        AppSignalRService appSignalRHub)
    {
        mediator = _mediator;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        this.notificationRepository = notificationRepository;
        this.appSignalRHub = appSignalRHub;
    }
    
    public async Task<Unit> Handle(SendInvitesToUsersFolders request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var permissionsRequests = request.UserIds.Select(userId => new UsersOnPrivateFolders()
            {
                AccessTypeId = request.RefTypeId,
                FolderId = request.FolderId,
                UserId = userId
            }).ToList();

            await usersOnPrivateFoldersRepository.AddRangeAsync(permissionsRequests);

            var notifications = request.UserIds.Select(userId => new Notification()
            {
                UserFromId = permissions.Caller.Id,
                UserToId = userId,
                TranslateKeyMessage = $"notification.SentInvitesToFolder",
                AdditionalMessage = request.Message,
                Date = DateTimeProvider.Time
            });

            await notificationRepository.AddRangeAsync(notifications);

            var updateCommand = new UpdatePermissionFolderWS();
            updateCommand.IdsToAdd.Add(request.FolderId);

            foreach (var notification in notifications)
            {
                await appSignalRHub.UpdatePermissionUserFolder(updateCommand, notification.UserToId);
            }
        }

        return Unit.Value;
    }
}