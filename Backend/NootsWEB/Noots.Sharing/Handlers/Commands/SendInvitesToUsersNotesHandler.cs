using Common;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Notes;
using Noots.SignalrUpdater.Impl;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Notifications;

namespace Noots.Sharing.Handlers.Commands;

public class SendInvitesToUsersNotesHandler : IRequestHandler<SendInvitesToUsersNotes, OperationResult<Unit>>
{
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationRepository notificationRepository;

    public SendInvitesToUsersNotesHandler(
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
        IMediator _mediator,
        AppSignalRService appSignalRHub,
        NotificationRepository notificationRepository)
    {
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationRepository = notificationRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(SendInvitesToUsersNotes request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {

            if (permissions.Note.IsLocked)
            {
                return new OperationResult<Unit>().SetContentLocked();
            }

            var permissionsRequests = request.UserIds.Select(userId => new UserOnPrivateNotes()
            {
                AccessTypeId = request.RefTypeId,
                NoteId = request.NoteId,
                UserId = userId
            }).ToList();

            await usersOnPrivateNotesRepository.AddRangeAsync(permissionsRequests);

            var notifications = request.UserIds.Select(userId => new Notification()
            {
                UserFromId = permissions.Caller.Id,
                UserToId = userId,
                TranslateKeyMessage = $"notification.SentInvitesToNote",
                AdditionalMessage = request.Message,
                Date = DateTimeProvider.Time
            });

            await notificationRepository.AddRangeAsync(notifications);

            var updateCommand = new UpdatePermissionNoteWS();
            updateCommand.IdsToAdd.Add(request.NoteId);

            foreach (var notification in notifications)
            {
                await appSignalRHub.UpdatePermissionUserNote(updateCommand, notification.UserToId);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}