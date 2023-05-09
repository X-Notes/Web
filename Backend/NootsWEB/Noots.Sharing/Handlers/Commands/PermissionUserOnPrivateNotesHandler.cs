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

public class PermissionUserOnPrivateNotesHandler : IRequestHandler<PermissionUserOnPrivateNotes, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

    public PermissionUserOnPrivateNotesHandler(
        IMediator _mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository)
    {
        mediator = _mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
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

            var updateCommand = new UpdatePermissionNoteWS();
            updateCommand.UpdatePermission(new UpdatePermissionEntity(access.NoteId, access.AccessTypeId));
            await appSignalRHub.UpdatePermissionUserNote(updateCommand, request.PermissionUserId);

            var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = permissions.Note.Title };
            await notificationService.AddAndSendNotification(permissions.Caller.Id, request.PermissionUserId, NotificationMessagesEnum.ChangeUserPermissionNoteV1, metadata);

            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}