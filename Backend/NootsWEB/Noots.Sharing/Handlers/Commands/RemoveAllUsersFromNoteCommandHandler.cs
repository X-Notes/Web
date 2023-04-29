using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Notifications.Services;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Notes;
using Noots.SignalrUpdater.Impl;

namespace Noots.Sharing.Handlers.Commands;

public class RemoveAllUsersFromNoteCommandHandler : IRequestHandler<RemoveAllUsersFromNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;

    public RemoveAllUsersFromNoteCommandHandler(
        IMediator _mediator, 
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
        AppSignalRService appSignalRHub,
        NotificationService notificationService)
    {
        mediator = _mediator;
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveAllUsersFromNoteCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var ents = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
            var userIds = ents.Select(x => x.UserId).ToList();
            await usersOnPrivateNotesRepository.RemoveRangeAsync(ents);

            foreach (var userId in userIds)
            {
                var updateCommand = new UpdatePermissionNoteWS();
                updateCommand.RevokeIds.Add(request.NoteId);
                await appSignalRHub.UpdatePermissionUserNote(updateCommand, userId);
            }

            var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = permissions.Note.Title };
            await notificationService.AddAndSendNotificationsAsync(permissions.Caller.Id, userIds, NotificationMessagesEnum.RemoveUserFromNoteV1, metadata, null);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}