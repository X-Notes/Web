using BI.signalR;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Folders;
using Common.DatabaseModels.models.Notes;
using Common.DatabaseModels.models.Users;
using Common.DTO.notifications;
using Common.Naming;
using Domain.Commands.share.folders;
using Domain.Commands.share.notes;
using Domain.Queries.permissions;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Notifications;
using WriteContext.Repositories.Users;

namespace BI.services.sharing
{
    public class SharingHandlerCommand :
        IRequestHandler<ChangeRefTypeFolders, Unit>,
        IRequestHandler<ChangeRefTypeNotes, Unit>,
        IRequestHandler<PermissionUserOnPrivateFolders, Unit>,
        IRequestHandler<RemoveUserFromPrivateFolders, Unit>,
        IRequestHandler<SendInvitesToUsersFolders, Unit>,
        IRequestHandler<SendInvitesToUsersNotes, Unit>,
        IRequestHandler<RemoveUserFromPrivateNotes, Unit>,
        IRequestHandler<PermissionUserOnPrivateNotes, Unit>
    {
        private readonly FolderRepository folderRepository;
        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
        private readonly IMediator _mediator;
        private readonly AppRepository appRepository;
        AppSignalRService appSignalRHub;
        private readonly NotificationRepository notificationRepository;
        public SharingHandlerCommand(
            FolderRepository folderRepository, 
            UserRepository userRepository, 
            NoteRepository noteRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
            AppRepository appRepository,
            NotificationRepository notificationRepository,
            IMediator _mediator,
            AppSignalRService appSignalRHub)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.appRepository = appRepository;
            this.notificationRepository = notificationRepository;
            this._mediator = _mediator;
            this.appSignalRHub = appSignalRHub;
        }



        public async Task<Unit> Handle(ChangeRefTypeFolders request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFoldersIncludeFolderType(request.Email);
            var folder = user.Folders.Where(x => request.Id == x.Id).FirstOrDefault();
            if (folder != null)
            {
                folder.RefTypeId = request.RefTypeId;
                if (folder.FolderType.Name != ModelsNaming.SharedFolder)
                {
                    var type = await appRepository.GetFolderTypeByName(ModelsNaming.SharedFolder);
                    var foldersList = new List<Folder>() { folder };
                    await folderRepository.CastFolders(foldersList, user.Folders, folder.FolderTypeId, type.Id);
                }
                else
                {
                    await folderRepository.Update(folder);
                }
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(ChangeRefTypeNotes request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var note = user.Notes.Where(x => request.Id == x.Id).FirstOrDefault();
            if (note != null)
            {
                note.RefTypeId = request.RefTypeId;
                if (note.NoteType.Name != ModelsNaming.SharedNote)
                {
                    var type = await appRepository.GetNoteTypeByName(ModelsNaming.SharedNote);
                    var notesList = new List<Note>() { note };
                    await noteRepository.CastNotes(notesList, user.Notes, note.NoteTypeId, type.Id);
                }
                else
                {
                    await noteRepository.Update(note);
                }
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(PermissionUserOnPrivateFolders request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var access = await this.usersOnPrivateFoldersRepository
                    .FirstOrDefault( x=> x.UserId == request.UserId && x.FolderId == request.FolderId);
                if (access != null)
                {
                    access.AccessTypeId = request.AccessTypeId;
                    await this.usersOnPrivateFoldersRepository.Update(access);
                }
                else
                {
                    var perm = new UsersOnPrivateFolders()
                    {
                        AccessTypeId = request.AccessTypeId,
                        FolderId = request.FolderId,
                        UserId = request.UserId
                    };
                    await this.usersOnPrivateFoldersRepository.Add(perm);

                }

                var notification = new Notification() // TODO MOVE TO SERVICE
                {
                    UserFromId = permissions.User.Id,
                    UserToId = request.UserId,
                    Message = "notification.ChangeUserPermissionFolder",
                    Date = DateTimeOffset.Now
                };

                await this.notificationRepository.Add(notification);

                var receiver = await userRepository.FirstOrDefault(x => x.Id == request.UserId);
                await appSignalRHub.SendNewNotification(receiver.Email, true);
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(PermissionUserOnPrivateNotes request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var access = await this.usersOnPrivateNotesRepository
                    .FirstOrDefault(x => x.NoteId == request.NoteId && x.UserId == request.UserId);
                if (access != null)
                {
                    access.AccessTypeId = request.AccessTypeId;
                    await this.usersOnPrivateNotesRepository.Update(access);
                }
                else
                {
                    var perm = new UsersOnPrivateFolders()
                    {
                        AccessTypeId = request.AccessTypeId,
                        FolderId = request.NoteId,
                        UserId = request.UserId
                    };
                    await this.usersOnPrivateFoldersRepository.Add(perm);
                }


                var notification = new Notification()
                {
                    UserFromId = permissions.User.Id,
                    UserToId = request.UserId,
                    Message = "notification.ChangeUserPermissionNote",
                    Date = DateTimeOffset.Now
                };

                await this.notificationRepository.Add(notification);

                var receiver = await userRepository.FirstOrDefault(x => x.Id == request.UserId);
                await appSignalRHub.SendNewNotification(receiver.Email, true);

            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveUserFromPrivateFolders request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var access = await this.usersOnPrivateFoldersRepository
                    .FirstOrDefault(x => x.UserId == request.UserId && x.FolderId == request.FolderId);
                if (access != null)
                {
                    await this.usersOnPrivateFoldersRepository.Remove(access);

                    var notification = new Notification()
                    {
                        UserFromId = permissions.User.Id,
                        UserToId = request.UserId,
                        Message = "notification.RemoveUserFromFolder",
                        Date = DateTimeOffset.Now
                    };

                    await this.notificationRepository.Add(notification);

                    var receiver = await userRepository.FirstOrDefault(x => x.Id == request.UserId);
                    await appSignalRHub.SendNewNotification(receiver.Email, true);
                }
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveUserFromPrivateNotes request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                var access = await this.usersOnPrivateNotesRepository
                    .FirstOrDefault(x => x.NoteId == request.NoteId && x.UserId == request.UserId);
                if (access != null)
                {
                    await this.usersOnPrivateNotesRepository.Remove(access);

                    var notification = new Notification()
                    {
                        UserFromId = permissions.User.Id,
                        UserToId = request.UserId,
                        Message = "notification.RemoveUserFromNote",
                        Date = DateTimeOffset.Now
                    };

                    await this.notificationRepository.Add(notification);

                    var receiver = await userRepository.FirstOrDefault(x => x.Id == request.UserId);
                    await appSignalRHub.SendNewNotification(receiver.Email, true);
                }
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(SendInvitesToUsersFolders request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);

            if(permissions.IsOwner)
            {
                var permissionsRequests = request.UserIds.Select(userId => new UsersOnPrivateFolders()
                {
                    AccessTypeId = request.RefTypeId,
                    FolderId = request.FolderId,
                    UserId = userId
                }).ToList();

                await this.usersOnPrivateFoldersRepository.AddRange(permissionsRequests);

                var notifications = request.UserIds.Select(userId => new Notification()
                {
                    UserFromId = permissions.User.Id,
                    UserToId = userId,
                    Message = $"notification.SentInvitesToFolder | message: {request.Message}",
                    Date = DateTimeOffset.Now
                });

                await this.notificationRepository.AddRange(notifications);

                foreach (var notification in notifications)
                {
                    var receiver = await userRepository.FirstOrDefault(x => x.Id == notification.UserToId);
                    await appSignalRHub.SendNewNotification(receiver.Email, true);
                }
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(SendInvitesToUsersNotes request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner) {
                var permissionsRequests = request.UserIds.Select(userId => new UserOnPrivateNotes()
                {
                    AccessTypeId = request.RefTypeId,
                    NoteId = request.NoteId,
                    UserId = userId
                }).ToList();

                await this.usersOnPrivateNotesRepository.AddRange(permissionsRequests);

                var notifications = request.UserIds.Select(userId => new Notification()
                {
                    UserFromId = permissions.User.Id,
                    UserToId = userId,
                    Message = $"notification.SentInvitesToNote | message: {request.Message}",
                    Date = DateTimeOffset.Now
                });

                await this.notificationRepository.AddRange(notifications);

                foreach(var notification in notifications)
                {
                    var receiver = await userRepository.FirstOrDefault(x => x.Id == notification.UserToId);
                    await appSignalRHub.SendNewNotification(receiver.Email, true);
                }
            }

            return Unit.Value;
        }
    }
}
