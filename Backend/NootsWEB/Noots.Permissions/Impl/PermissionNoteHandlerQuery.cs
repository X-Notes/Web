using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using MediatR;
using Noots.DatabaseContext.Repositories.Files;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Users;
using Permissions.Entities;
using Permissions.Queries;

namespace Permissions.Impl
{
    public class PermissionNoteHandlerQuery
        : IRequestHandler<GetUserPermissionsForNoteQuery, UserPermissionsForNote>,
          IRequestHandler<GetUserPermissionsForNotesManyQuery, List<(Guid, UserPermissionsForNote)>>,
          IRequestHandler<GetPermissionUploadFileQuery, PermissionUploadFileEnum>
    {
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly FileRepository fileRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;

        public PermissionNoteHandlerQuery(
            UserRepository userRepository,
            NoteRepository noteRepository,
            FileRepository fileRepository,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.fileRepository = fileRepository;
            this.foldersNotesRepository = foldersNotesRepository;
        }

        public async Task<UserPermissionsForNote> Handle(GetUserPermissionsForNoteQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            var note = await noteRepository.GetForCheckPermission(request.NoteId);
            var folderNotes = await foldersNotesRepository.GetByNoteIdsIncludeFolderAndUsers(request.NoteId);
            return GetNotePermission(note, user, folderNotes);
        }

        private bool IsContainsSharedFolder(Note note, List<FoldersNotes> foldersNotes)
        {
            if (foldersNotes == null) return false;
            return foldersNotes.Where(x => x.NoteId == note.Id).Any(x => x.Folder.IsShared() || x.Folder.ContainsPrivateUsers());
        }

        private UserPermissionsForNote GetNotePermission(Note note, User caller, List<FoldersNotes> foldersNotes)
        {
            if (note == null)
            {
                return new UserPermissionsForNote().SetNoteNotFounded();
            }

            var containsSharedFolders = IsContainsSharedFolder(note, foldersNotes);

            if (note.UserId == caller?.Id)
            {
                return new UserPermissionsForNote().SetFullAccess(caller, note, containsSharedFolders);
            }

            var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == caller?.Id);
            if (noteUser != null && noteUser.AccessTypeId == RefTypeENUM.Editor)
            {
                return new UserPermissionsForNote().SetFullAccess(caller, note, containsSharedFolders);
            }

            if (note.NoteTypeId == NoteTypeENUM.Shared)
            {
                switch (note.RefTypeId)
                {
                    case RefTypeENUM.Editor:
                        {
                            if (caller == null)
                            {
                                return new UserPermissionsForNote().SetOnlyRead(caller, note, containsSharedFolders);
                            }
                            return new UserPermissionsForNote().SetFullAccess(caller, note, containsSharedFolders);
                        }
                    case RefTypeENUM.Viewer:
                        {
                            return new UserPermissionsForNote().SetOnlyRead(caller, note, containsSharedFolders);
                        }
                }
            }

            if (noteUser != null && noteUser.AccessTypeId == RefTypeENUM.Viewer)
            {
                return new UserPermissionsForNote().SetOnlyRead(caller, note, containsSharedFolders);
            }

            return new UserPermissionsForNote().SetNoAccessRights(caller, note, containsSharedFolders);
        }


        public async Task<PermissionUploadFileEnum> Handle(GetPermissionUploadFileQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByIdIncludeBilling(request.UserId);
            var currentMemory = await fileRepository.GetTotalUserMemory(user.Id);
            if (currentMemory + request.FileSize < user.BillingPlan.MaxSize)
            {
                return PermissionUploadFileEnum.CanUpload;
            }
            return PermissionUploadFileEnum.NoCanUpload;
        }


        public async Task<List<(Guid, UserPermissionsForNote)>> Handle(GetUserPermissionsForNotesManyQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            if (user != null)
            {
                var notes = await noteRepository.GetForCheckPermissions(request.NoteIds);
                var notesD = notes.ToDictionary(x => x.Id);
                var folderNotes = await foldersNotesRepository.GetByNoteIdsIncludeFolderAndUsers(request.NoteIds.ToArray());

                var result = new List<(Guid, UserPermissionsForNote)>();

                foreach (var id in request.NoteIds)
                {
                    if (notesD.ContainsKey(id))
                    {
                        var noteD = notesD[id];
                        result.Add((id, GetNotePermission(noteD, user, folderNotes)));
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
