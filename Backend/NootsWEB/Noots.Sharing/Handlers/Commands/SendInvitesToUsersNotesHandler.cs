using Common.DatabaseModels.Models.Notes;
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

public class SendInvitesToUsersNotesHandler : IRequestHandler<SendInvitesToUsersNotes, OperationResult<Unit>>
{
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;

    public SendInvitesToUsersNotesHandler(
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
        IMediator _mediator,
        AppSignalRService appSignalRHub,
        NotificationService notificationService)
    {
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
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

            var updateCommand = new UpdatePermissionNoteWS();
            updateCommand.IdsToAdd.Add(request.NoteId);
            foreach (var userId in request.UserIds)
            {
                await appSignalRHub.UpdatePermissionUserNote(updateCommand, userId);
            }

            // NOTIFICATIONS
            var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = permissions.Note.Title };
            await notificationService.AddNotificationsAsync(permissions.Caller.Id, request.UserIds, NotificationMessagesEnum.SentInvitesToNoteV1, metadata);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}