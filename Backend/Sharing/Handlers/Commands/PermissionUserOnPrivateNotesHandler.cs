using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Notifications.Services;
using Permissions.Queries;
using Sharing.Commands.Notes;
using SignalrUpdater.Impl;

namespace Sharing.Handlers.Commands;

public class PermissionUserOnPrivateNotesHandler : IRequestHandler<PermissionUserOnPrivateNotes, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly NoteRepository noteRepository;

    public PermissionUserOnPrivateNotesHandler(
        IMediator mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
        NoteRepository noteRepository)
    {
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        this.noteRepository = noteRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(PermissionUserOnPrivateNotes request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {

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

            var note = await noteRepository.FirstOrDefaultNoTrackingAsync(x => x.Id == request.NoteId);
            
            var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = note.Title };
            await notificationService.AddAndSendNotification(permissions.CallerId, request.PermissionUserId, NotificationMessagesEnum.ChangeUserPermissionNoteV1, metadata);

            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}