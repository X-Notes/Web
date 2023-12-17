using Common;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using DatabaseContext.Repositories.Files;
using DatabaseContext.Repositories.Notes;
using DatabaseContext.Repositories.Users;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Permissions.Entities;
using Permissions.Queries;

namespace Permissions.QueryHandlers
{
    public class PermissionNoteHandlerQuery
        : IRequestHandler<GetUserPermissionsForNoteQuery, UserPermissionsForNote>,
          IRequestHandler<GetUserPermissionsForNotesManyQuery, List<(Guid, UserPermissionsForNote)>>,
          IRequestHandler<GetPermissionUploadFileQuery, PermissionUploadFileEnum>
    {
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly FileRepository fileRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly IMemoryCache memoryCache;

        public PermissionNoteHandlerQuery(
            UserRepository userRepository,
            NoteRepository noteRepository,
            FileRepository fileRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            IMemoryCache memoryCache)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.fileRepository = fileRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.memoryCache = memoryCache;
        }
        
        // CACHE FUNCTIONS
        
        private bool GetInOwnerCached(Guid noteId, Guid callerId)
        {
            var key = CacheKeys.NoteOwner + noteId + "-" + callerId;
            return memoryCache.TryGetValue(key, out bool cacheValue);
        }

        private void SetNoteOwnerCache(Guid noteId, Guid callerId)
        {
            var key = CacheKeys.NoteOwner + noteId + "-" + callerId;
            var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromHours(1));
            memoryCache.Set(key, true, cacheEntryOptions);
        }

        public async Task<UserPermissionsForNote> Handle(GetUserPermissionsForNoteQuery request, CancellationToken cancellationToken)
        {
            if (GetInOwnerCached(request.NoteId, request.UserId))
            {
                return new UserPermissionsForNote().GetFullAccess(request.UserId, request.UserId, request.NoteId);
            }
            
            var note = await noteRepository.FirstOrDefaultNoTrackingAsync(x => x.Id == request.NoteId);
            return await GetNotePermissionAsync(note, request.UserId);
        }

        private async Task<UserPermissionsForNote> GetNotePermissionAsync(Note? note, Guid callerId)
        {
            var isAnonymous = callerId == Guid.Empty;
            
            if (note == null)
            {
                return new UserPermissionsForNote().GetNoteNotFounded();
            }
            
            if (note.UserId == callerId)
            {
                SetNoteOwnerCache(note.Id, callerId);
                return new UserPermissionsForNote().GetFullAccess(note.UserId, callerId, note.Id);
            }
            
            
            if (note.NoteTypeId == NoteTypeENUM.Shared)
            {
                if (note.RefTypeId == RefTypeENUM.Viewer || isAnonymous)
                {
                    return new UserPermissionsForNote().GetOnlyRead(note.UserId, callerId, note.Id);
                }
            
                return new UserPermissionsForNote().GetFullAccess(note.UserId, callerId, note.Id);
            }
            
            if (isAnonymous)
            {
                return new UserPermissionsForNote().GetNoAccessRights(note.UserId, callerId, note.Id);
            }
            
            var folderUser = await usersOnPrivateNotesRepository.GetUserAsync(note.Id, callerId);
            if (folderUser is { AccessTypeId: RefTypeENUM.Editor })
            {
                return new UserPermissionsForNote().GetFullAccess(note.UserId, callerId, note.Id);
            }
        
            if (folderUser is { AccessTypeId: RefTypeENUM.Viewer })
            {
                return new UserPermissionsForNote().GetOnlyRead(note.UserId, callerId, note.Id);
            }

            return new UserPermissionsForNote().GetNoAccessRights(note.UserId, callerId, note.Id);
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
            if (request.NoteIds == null)
            {
                return new List<(Guid, UserPermissionsForNote)>();
            }
        
            var results = new List<(Guid, UserPermissionsForNote)>();
            var cachedValues = new List<Guid>();
        
            foreach (var folderId in request.NoteIds)
            {
                if (GetInOwnerCached(folderId, request.UserId))
                {
                    cachedValues.Add(folderId);
                    var access = new UserPermissionsForNote().GetFullAccess(request.UserId, request.UserId, folderId);
                    results.Add((folderId, access));
                }
            }

            var valuesWhichNeedToProcess = request.NoteIds.Except(cachedValues).ToList();

            if (valuesWhichNeedToProcess.Count == 0)
            {
                return results;
            }
        
            var notes = await noteRepository.GetWhereAsNoTrackingAsync(x => valuesWhichNeedToProcess.Contains(x.Id));
            var notesD = notes.ToDictionary(x => x.Id);
        
            foreach (var id in valuesWhichNeedToProcess)
            {
                if (notesD.TryGetValue(id, out var noteD))
                {
                    var permission = await GetNotePermissionAsync(noteD, request.UserId);
                    results.Add((id, permission));
                }
                else
                {
                    results.Add((id, new UserPermissionsForNote().GetNoteNotFounded()));
                }
            }
        
            return results;
        }
    }
}
