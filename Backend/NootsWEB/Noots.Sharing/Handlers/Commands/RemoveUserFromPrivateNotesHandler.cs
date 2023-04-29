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

public class RemoveUserFromPrivateNotesHandler : IRequestHandler<RemoveUserFromPrivateNotes, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

    public RemoveUserFromPrivateNotesHandler(
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

                var updateCommand = new UpdatePermissionNoteWS();
                updateCommand.RevokeIds.Add(request.NoteId);
                await appSignalRHub.UpdatePermissionUserNote(updateCommand, request.PermissionUserId);

                var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = permissions.Note.Title };
                await notificationService.AddNotificationAsync(permissions.Caller.Id, request.PermissionUserId, NotificationMessagesEnum.RemoveUserFromNoteV1, metadata, null);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}