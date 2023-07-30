using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Notifications.Services;
using Noots.Permissions.Impl;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Notes;
using Noots.SignalrUpdater.Impl;

namespace Noots.Sharing.Handlers.Commands;

public class RemoveAllUsersFromNoteCommandHandler : IRequestHandler<RemoveAllUsersFromNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;

    public RemoveAllUsersFromNoteCommandHandler(
        IMediator _mediator,
        UsersOnPrivateNotesService usersOnPrivateNotesService,
        AppSignalRService appSignalRHub,
        NotificationService notificationService)
    {
        mediator = _mediator;
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveAllUsersFromNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var userIds =  await usersOnPrivateNotesService.RevokeAllPermissionsNote(request.NoteId);
  
            foreach (var userId in userIds)
            {
                var updateCommand = new UpdatePermissionNoteWS();
                updateCommand.RevokeIds.Add(request.NoteId);
                await appSignalRHub.UpdatePermissionUserNote(updateCommand, userId);
            }

            var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = permissions.Note.Title };
            await notificationService.AddAndSendNotificationsAsync(permissions.Caller.Id, userIds, NotificationMessagesEnum.RemoveUserFromNoteV1, metadata);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}