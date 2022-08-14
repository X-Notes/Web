using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.WebSockets.Permissions;
using Domain.Commands.Share.Folders;
using Domain.Commands.Share.Notes;
using MediatR;
using Noots.Permissions.Queries;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Notifications;

namespace BI.Services.Sharing
{
    public class SharingHandlerCommand :
        IRequestHandler<ChangeRefTypeFolders, OperationResult<Unit>>,
        IRequestHandler<ChangeRefTypeNotes, OperationResult<Unit>>,
        IRequestHandler<PermissionUserOnPrivateFolders, OperationResult<Unit>>,
        IRequestHandler<RemoveUserFromPrivateFolders, OperationResult<Unit>>,
        IRequestHandler<SendInvitesToUsersFolders, Unit>,
        IRequestHandler<SendInvitesToUsersNotes, OperationResult<Unit>>,
        IRequestHandler<RemoveUserFromPrivateNotes, OperationResult<Unit>>,
        IRequestHandler<PermissionUserOnPrivateNotes, OperationResult<Unit>>,
        IRequestHandler<RemoveAllUsersFromFolderCommand, OperationResult<Unit>>,
        IRequestHandler<RemoveAllUsersFromNoteCommand, OperationResult<Unit>>
    {
        private readonly FolderRepository folderRepository;
        private readonly NoteRepository noteRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
        private readonly IMediator _mediator;

        AppSignalRService appSignalRHub;
        private readonly NotificationRepository notificationRepository;
        public SharingHandlerCommand(
            FolderRepository folderRepository,
            NoteRepository noteRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
            NotificationRepository notificationRepository,
            IMediator _mediator,
            AppSignalRService appSignalRHub)
        {
            this.folderRepository = folderRepository;
            this.noteRepository = noteRepository;
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.notificationRepository = notificationRepository;
            this._mediator = _mediator;
            this.appSignalRHub = appSignalRHub;
        }



        public async Task<OperationResult<Unit>> Handle(ChangeRefTypeFolders request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);
            var isCanEdit = permissions.All(x => x.perm.IsOwner);

            if (isCanEdit) {
                foreach (var perm in permissions)
                {
                    var folder = perm.perm.Folder;
                    folder.RefTypeId = request.RefTypeId;
                    folder.ToType(FolderTypeENUM.Shared);
                    await folderRepository.UpdateAsync(folder);
                }
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(ChangeRefTypeNotes request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);
            var isCanEdit = permissions.All(x => x.perm.IsOwner);
            if (isCanEdit)
            {
                foreach (var perm in permissions)
                {
                    var note = perm.perm.Note;

                    if (note.IsLocked)
                    {
                        return new OperationResult<Unit>().SetContentLocked();
                    }

                    note.RefTypeId = request.RefTypeId;
                    note.ToType(NoteTypeENUM.Shared);
                    await noteRepository.UpdateAsync(note);
                }
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(PermissionUserOnPrivateFolders request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var access = await usersOnPrivateFoldersRepository
                    .FirstOrDefaultAsync(x => x.UserId == request.PermissionUserId && x.FolderId == request.FolderId);

                if (access == null)
                {
                    return new OperationResult<Unit>().SetNotFound();
                }

                access.AccessTypeId = request.AccessTypeId;
                await usersOnPrivateFoldersRepository.UpdateAsync(access);

                var notification = new Notification() // TODO MOVE TO SERVICE
                {
                    UserFromId = permissions.Caller.Id,
                    UserToId = request.PermissionUserId,
                    TranslateKeyMessage = "notification.ChangeUserPermissionFolder",
                    Date = DateTimeProvider.Time
                };

                await notificationRepository.AddAsync(notification);

                var updateCommand = new UpdatePermissionFolderWS();
                updateCommand.UpdatePermission(new UpdatePermissionEntity(access.FolderId, access.AccessTypeId));

                await appSignalRHub.UpdatePermissionUserFolder(updateCommand, request.PermissionUserId);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(PermissionUserOnPrivateNotes request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

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

        public async Task<OperationResult<Unit>> Handle(RemoveUserFromPrivateFolders request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var access = await usersOnPrivateFoldersRepository
                    .FirstOrDefaultAsync(x => x.UserId == request.PermissionUserId && x.FolderId == request.FolderId);
                if (access != null)
                {
                    await usersOnPrivateFoldersRepository.RemoveAsync(access);

                    var notification = new Notification()
                    {
                        UserFromId = permissions.Caller.Id,
                        UserToId = request.PermissionUserId,
                        TranslateKeyMessage = "notification.RemoveUserFromFolder",
                        Date = DateTimeProvider.Time
                    };

                    await notificationRepository.AddAsync(notification);

                    var updateCommand = new UpdatePermissionFolderWS();
                    updateCommand.RevokeIds.Add(request.FolderId);

                    await appSignalRHub.UpdatePermissionUserFolder(updateCommand, request.PermissionUserId);

                    return new OperationResult<Unit>(true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveUserFromPrivateNotes request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

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

        public async Task<Unit> Handle(SendInvitesToUsersFolders request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var permissionsRequests = request.UserIds.Select(userId => new UsersOnPrivateFolders()
                {
                    AccessTypeId = request.RefTypeId,
                    FolderId = request.FolderId,
                    UserId = userId
                }).ToList();

                await usersOnPrivateFoldersRepository.AddRangeAsync(permissionsRequests);

                var notifications = request.UserIds.Select(userId => new Notification()
                {
                    UserFromId = permissions.Caller.Id,
                    UserToId = userId,
                    TranslateKeyMessage = $"notification.SentInvitesToFolder",
                    AdditionalMessage = request.Message,
                    Date = DateTimeProvider.Time
                });

                await notificationRepository.AddRangeAsync(notifications);

                var updateCommand = new UpdatePermissionFolderWS();
                updateCommand.IdsToAdd.Add(request.FolderId);

                foreach (var notification in notifications)
                {
                    await appSignalRHub.UpdatePermissionUserFolder(updateCommand, notification.UserToId);
                }
            }

            return Unit.Value;
        }

        public async Task<OperationResult<Unit>> Handle(SendInvitesToUsersNotes request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

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

        public async Task<OperationResult<Unit>> Handle(RemoveAllUsersFromFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            { 
                var ents = await usersOnPrivateFoldersRepository.GetWhereAsync(x => x.FolderId == request.FolderId);
                await usersOnPrivateFoldersRepository.RemoveRangeAsync(ents);

                foreach (var en in ents)
                {
                    var updateCommand = new UpdatePermissionFolderWS();
                    updateCommand.RevokeIds.Add(request.FolderId);
                    await appSignalRHub.UpdatePermissionUserFolder(updateCommand, en.UserId);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveAllUsersFromNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var ents = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
                await usersOnPrivateNotesRepository.RemoveRangeAsync(ents);

                foreach(var en in ents)
                {
                    var updateCommand = new UpdatePermissionNoteWS();
                    updateCommand.RevokeIds.Add(request.NoteId);
                    await appSignalRHub.UpdatePermissionUserNote(updateCommand, en.UserId);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }
    }
}
