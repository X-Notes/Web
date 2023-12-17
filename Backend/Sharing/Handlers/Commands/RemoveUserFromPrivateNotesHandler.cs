using Common.DatabaseModels.Models.Users.Notifications;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Notifications.Services;
using Permissions.Queries;
using Permissions.Services;
using Sharing.Commands.Notes;
using SignalrUpdater.Impl;

namespace Sharing.Handlers.Commands;

public class RemoveUserFromPrivateNotesHandler : IRequestHandler<RemoveUserFromPrivateNotes, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;
    private readonly NoteRepository noteRepository;

    public RemoveUserFromPrivateNotesHandler(
        IMediator mediator, 
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        UsersOnPrivateNotesService usersOnPrivateNotesService,
        NoteRepository noteRepository)
    {
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
        this.noteRepository = noteRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(RemoveUserFromPrivateNotes request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.IsOwner)
        {
            var isRevoked = await usersOnPrivateNotesService.RevokePermissionsNotes(request.PermissionUserId, new List<Guid> { request.NoteId });
            if (isRevoked)
            {
                var updateCommand = new UpdatePermissionNoteWS();
                updateCommand.RevokeIds.Add(request.NoteId);
                await appSignalRHub.UpdatePermissionUserNote(updateCommand, request.PermissionUserId);

                var note = await noteRepository.FirstOrDefaultNoTrackingAsync(x => x.Id == request.NoteId);
                var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = note.Title };
                await notificationService.AddAndSendNotification(permissions.CallerId, request.PermissionUserId, NotificationMessagesEnum.RemoveUserFromNoteV1, metadata);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}