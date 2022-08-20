using Common;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Notifications;
using Noots.Permissions.Queries;
using Noots.Sharing.Commands.Notes;
using Noots.SignalrUpdater.Impl;

namespace Noots.Sharing.Handlers.Commands;

public class PermissionUserOnPrivateNotesHandler : IRequestHandler<PermissionUserOnPrivateNotes, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationRepository notificationRepository;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

    public PermissionUserOnPrivateNotesHandler(
        IMediator _mediator, 
        AppSignalRService appSignalRHub,
        NotificationRepository notificationRepository,
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationRepository = notificationRepository;
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(PermissionUserOnPrivateNotes request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {

            if (permissions.Note.IsLocked)
            {
                return new OperationResult<Unit>().SetContentLocked();
            }

            var access = await usersOnPrivateNotesRepository
                .FirstOrDefaultAsync(x => x.NoteId == request.NoteId && x.UserId == request.PermissionUserId);

            if (access == null)
            {
                return new OperationResult<Unit>().SetNotFound();
            }

            access.AccessTypeId = request.AccessTypeId;
            await usersOnPrivateNotesRepository.UpdateAsync(access);

            var notification = new Notification()
            {
                UserFromId = permissions.Caller.Id,
                UserToId = request.PermissionUserId,
                TranslateKeyMessage = "notification.ChangeUserPermissionNote",
                Date = DateTimeProvider.Time
            };

            await notificationRepository.AddAsync(notification);

            var updateCommand = new UpdatePermissionNoteWS();
            updateCommand.UpdatePermission(new UpdatePermissionEntity(access.NoteId, access.AccessTypeId));

            await appSignalRHub.UpdatePermissionUserNote(updateCommand, request.PermissionUserId);

            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}