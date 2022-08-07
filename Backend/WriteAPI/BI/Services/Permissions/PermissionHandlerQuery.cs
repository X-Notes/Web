using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Services.Encryption;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Permissions;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.Services.Permissions
{
    public class PermissionHandlerQuery
        : IRequestHandler<GetUserPermissionsForNoteQuery, UserPermissionsForNote>,
          IRequestHandler<GetUserPermissionsForFolderQuery, UserPermissionsForFolder>,
          IRequestHandler<GetUserPermissionsForFoldersManyQuery, List<(Guid, UserPermissionsForFolder)>>,
          IRequestHandler<GetUserPermissionsForNotesManyQuery, List<(Guid, UserPermissionsForNote)>>,
          IRequestHandler<GetPermissionUploadFileQuery, PermissionUploadFileEnum>
    {
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly FileRepository fileRepository;
        private readonly FolderRepository folderRepository;

        public PermissionHandlerQuery(
            UserRepository userRepository,
            NoteRepository noteRepository,
            FolderRepository folderRepository,
            FileRepository fileRepository)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.folderRepository = folderRepository;
            this.fileRepository = fileRepository;
        }

        public async Task<UserPermissionsForNote> Handle(GetUserPermissionsForNoteQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            var note = await noteRepository.GetForCheckPermission(request.NoteId);
            return GetNotePermission(note, user);
        }

        private UserPermissionsForNote GetNotePermission(Note note, User caller)
        {
            if (note == null)
            {
                return new UserPermissionsForNote().SetNoteNotFounded();
            }

            if (note.UserId == caller?.Id)
            {
                return new UserPermissionsForNote().SetFullAccess(caller, note);
            }


            var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == caller?.Id);
            if (noteUser != null && noteUser.AccessTypeId == RefTypeENUM.Editor)
            {
                return new UserPermissionsForNote().SetFullAccess(caller, note);
            }

            if (note.NoteTypeId == NoteTypeENUM.Shared)
            {
                switch (note.RefTypeId)
                {
                    case RefTypeENUM.Editor:
                        {
                            if (caller == null)
                            {
                                return new UserPermissionsForNote().SetOnlyRead(caller, note);
                            }
                            return new UserPermissionsForNote().SetFullAccess(caller, note);
                        }
                    case RefTypeENUM.Viewer:
                        {
                            return new UserPermissionsForNote().SetOnlyRead(caller, note);
                        }
                }
            }

            if (noteUser != null && noteUser.AccessTypeId == RefTypeENUM.Viewer)
            {
                return new UserPermissionsForNote().SetOnlyRead(caller, note);
            }

            return new UserPermissionsForNote().SetNoAccessRights(caller, note);
        }

        public async Task<UserPermissionsForFolder> Handle(GetUserPermissionsForFolderQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            var folder = await folderRepository.GetForCheckPermission(request.FolderId);
            return GetFolderPermission(folder, user);
        }

        private UserPermissionsForFolder GetFolderPermission(Folder folder, User caller)
        {
            if (folder == null)
            {
                return new UserPermissionsForFolder().SetFolderNotFounded();
            }

            if (folder.UserId == caller?.Id)
            {
                return new UserPermissionsForFolder().GetFullAccess(caller, folder);
            }

            var folderUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == caller?.Id);
            if (folderUser != null && folderUser.AccessTypeId == RefTypeENUM.Editor)
            {
                return new UserPermissionsForFolder().GetFullAccess(caller, folder);
            }

            if (folder.FolderTypeId == FolderTypeENUM.Shared)
            {
                switch (folder.RefTypeId)
                {
                    case RefTypeENUM.Editor:
                        {
                            if (caller == null)
                            {
                                return new UserPermissionsForFolder().GetOnlyRead(caller, folder);
                            }
                            return new UserPermissionsForFolder().GetFullAccess(caller, folder);
                        }
                    case RefTypeENUM.Viewer:
                        {
                            return new UserPermissionsForFolder().GetOnlyRead(caller, folder);
                        }
                }
            }

            if (folderUser != null && folderUser.AccessTypeId == RefTypeENUM.Viewer)
            {
                return new UserPermissionsForFolder().GetOnlyRead(caller, folder);
            }

            return new UserPermissionsForFolder().NoAccessRights(caller, folder);

        }

        public async Task<PermissionUploadFileEnum> Handle(GetPermissionUploadFileQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByIdIncludeBilling(request.UserId);
            var currentMemory = await fileRepository.GetTotalUserMemory(user.Id);
            if ( (currentMemory + request.FileSize) < user.BillingPlan.MaxSize)
            {
                return PermissionUploadFileEnum.CanUpload;
            }
            return PermissionUploadFileEnum.NoCanUpload;
        }

        public async Task<List<(Guid, UserPermissionsForFolder)>> Handle(GetUserPermissionsForFoldersManyQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            if (user != null)
            {
                var folders = await folderRepository.GetForCheckPermissions(request.FolderIds);
                var foldersD = folders.ToDictionary(x => x.Id);

                var result = new List<(Guid, UserPermissionsForFolder)>();

                foreach (var id in request.FolderIds)
                {
                    if (foldersD.ContainsKey(id))
                    {
                        var folderD = foldersD[id];
                        result.Add((id, GetFolderPermission(folderD, user)));
                    }
                    else
{
                        result.Add((id, new UserPermissionsForFolder().SetFolderNotFounded()));
                    }
                }
                return result;
            }
            return new List<(Guid, UserPermissionsForFolder)>();
        }

        public async Task<List<(Guid, UserPermissionsForNote)>> Handle(GetUserPermissionsForNotesManyQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            if (user != null)
            {
                var notes = await noteRepository.GetForCheckPermissions(request.NoteIds);
                var notesD = notes.ToDictionary(x => x.Id);

                var result = new List<(Guid, UserPermissionsForNote)>();

                foreach (var id in request.NoteIds)
                {
                    if (notesD.ContainsKey(id))
                    {
                        var noteD = notesD[id];
                        result.Add((id, GetNotePermission(noteD, user)));
                    }
                    else
                    {
                        result.Add((id, new UserPermissionsForNote().SetNoteNotFounded()));
                    }
                }
                return result;
            }
            return new List<(Guid, UserPermissionsForNote)>();
        }
    }
}
