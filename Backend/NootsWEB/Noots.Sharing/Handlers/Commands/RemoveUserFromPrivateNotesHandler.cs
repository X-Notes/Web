using Common;
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

public class RemoveUserFromPrivateNotesHandler : IRequestHandler<RemoveUserFromPrivateNotes, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationRepository notificationRepository;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

    public RemoveUserFromPrivateNotesHandler(
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
    
    public async Task<OperationResult<Unit>> Handle(RemoveUserFromPrivateNotes request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var access = await usersOnPrivateNotesRepository
                .FirstOrDefaultAsync(x => x.NoteId == request.NoteId && x.UserId == request.PermissionUserId);
            if (access != null)
            {
                await usersOnPrivateNotesRepository.RemoveAsync(access);

                var notification = new Notification()
                {
                    UserFromId = permissions.Caller.Id,
                    UserToId = request.PermissionUserId,
                    TranslateKeyMessage = "notification.RemoveUserFromNote",
                    Date = DateTimeProvider.Time
                };

                await notificationRepository.AddAsync(notification);

                var updateCommand = new UpdatePermissionNoteWS();
                updateCommand.RevokeIds.Add(request.NoteId);

                await appSignalRHub.UpdatePermissionUserNote(updateCommand, request.PermissionUserId);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}