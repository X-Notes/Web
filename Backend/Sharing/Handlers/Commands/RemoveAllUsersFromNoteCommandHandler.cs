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

public class RemoveAllUsersFromNoteCommandHandler : IRequestHandler<RemoveAllUsersFromNoteCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly NoteRepository noteRepository;

    public RemoveAllUsersFromNoteCommandHandler(
        IMediator mediator,
        UsersOnPrivateNotesService usersOnPrivateNotesService,
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        NoteRepository noteRepository)
    {
        this.mediator = mediator;
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.noteRepository = noteRepository;
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

            var note = await noteRepository.FirstOrDefaultNoTrackingAsync(x => x.Id == request.NoteId);
            var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = note.Title };
            await notificationService.AddAndSendNotificationsAsync(permissions.CallerId, userIds, NotificationMessagesEnum.RemoveUserFromNoteV1, metadata);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNoPermissions();
    }
}