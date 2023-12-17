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

public class SendInvitesToUsersNotesHandler : IRequestHandler<SendInvitesToUsersNotes, OperationResult<Unit>>
{
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;
    private readonly IMediator mediator;
    private readonly AppSignalRService appSignalRHub;
    private readonly NotificationService notificationService;
    private readonly NoteRepository noteRepository;

    public SendInvitesToUsersNotesHandler(
        UsersOnPrivateNotesService usersOnPrivateNotesService,
        IMediator mediator,
        AppSignalRService appSignalRHub,
        NotificationService notificationService,
        NoteRepository noteRepository)
    {
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
        this.mediator = mediator;
        this.appSignalRHub = appSignalRHub;
        this.notificationService = notificationService;
        this.noteRepository = noteRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(SendInvitesToUsersNotes request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (!permissions.IsOwner)
        {
            return new OperationResult<Unit>().SetNoPermissions();
        }
        
        await usersOnPrivateNotesService.AddPermissionsAsync(request.NoteId, request.RefTypeId, request.UserIds);

        var updateCommand = new UpdatePermissionNoteWS();
        updateCommand.IdsToAdd.Add(request.NoteId);
        foreach (var userId in request.UserIds)
        {
            await appSignalRHub.UpdatePermissionUserNote(updateCommand, userId);
        }

        // NOTIFICATIONS
        var note = await noteRepository.FirstOrDefaultNoTrackingAsync(x => x.Id == request.NoteId);
        var metadata = new NotificationMetadata { NoteId = request.NoteId, Title = note.Title };
        await notificationService.AddAndSendNotificationsAsync(request.UserId, request.UserIds, NotificationMessagesEnum.SentInvitesToNoteV1, metadata);

        return new OperationResult<Unit>(true, Unit.Value);
    }
}