using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Notes.AdditionalContent;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Personalization;
using Common.DTO.Users;
using Domain.Queries.Notes;
using MediatR;
using Noots.Encryption.Impl;
using Noots.Mapper.Mapping;
using Noots.MapperLocked;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.Services.Notes
{
    public class NoteHandlerQuery :
        IRequestHandler<GetAdditionalContentNoteInfoQuery, List<BottomNoteContent>>,
        IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>,
        IRequestHandler<GetNotesByNoteIdsQuery, OperationResult<List<SmallNote>>>,
        IRequestHandler<GetAllNotesQuery, List<SmallNote>>,
        IRequestHandler<GetFullNoteQuery, OperationResult<FullNote>>,
        IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>,
        IRequestHandler<GetNoteContentsQuery, OperationResult<List<BaseNoteContentDTO>>>
    {

        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly NoteFolderLabelMapper appCustomMapper;
        private readonly IMediator _mediator;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly WebsocketsNotesServiceStorage websocketsNotesService;
        private readonly UserBackgroundMapper userBackgroundMapper;
        private readonly UserNoteEncryptService userNoteEncryptStorage;
        private readonly CollectionNoteRepository collectionNoteRepository;
        private readonly NoteSnapshotRepository noteSnapshotRepository;
        private readonly MapperLockedEntities mapperLockedEntities;

        public NoteHandlerQuery(
            NoteRepository noteRepository,
            UserRepository userRepository,
            NoteFolderLabelMapper noteCustomMapper,
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            FoldersNotesRepository foldersNotesRepository,
            WebsocketsNotesServiceStorage websocketsNotesService,
            UserBackgroundMapper userBackgroundMapper,
            UserNoteEncryptService userNoteEncryptStorage,
            CollectionNoteRepository collectionNoteRepository,
            NoteSnapshotRepository noteSnapshotRepository,
            MapperLockedEntities mapperLockedEntities)
        {
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.appCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.foldersNotesRepository = foldersNotesRepository;
            this.websocketsNotesService = websocketsNotesService;
            this.userBackgroundMapper = userBackgroundMapper;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
            this.collectionNoteRepository = collectionNoteRepository;
            this.noteSnapshotRepository = noteSnapshotRepository;
            this.mapperLockedEntities = mapperLockedEntities;
        }

        public async Task<List<SmallNote>> Handle(GetNotesByTypeQuery request, CancellationToken cancellationToken)
        {
            var notes = await noteRepository.GetNotesByUserIdAndTypeIdWithContent(request.UserId, request.TypeId, request.Settings);

            if (NoteTypeENUM.Shared == request.TypeId)
            {
                var sharedNotes = await GetSharedNotes(request.UserId, request.Settings);
                notes.AddRange(sharedNotes);
                notes = notes.DistinctBy(x => x.Id).ToList();
            }

            notes.ForEach(x => x.LabelsNotes = x.LabelsNotes?.GetLabelUnDesc());

            return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
        }


        private async Task<List<Note>> GetSharedNotes(Guid userId, PersonalizationSettingDTO settings)
        {
            var usersOnPrivateNotes = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.UserId == userId);
            var notesIds = usersOnPrivateNotes.Select(x => x.NoteId);
            var sharedNotes = await noteRepository.GetNotesByNoteIdsIdWithContent(notesIds, settings);
            sharedNotes.ForEach(x => x.NoteTypeId = NoteTypeENUM.Shared);
            return sharedNotes;
        }

        public async Task<OperationResult<FullNote>> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var isCanRead = permissions.CanRead;

            if (request.FolderId.HasValue && !isCanRead)
            {
                var queryFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
                var permissionsFolder = await _mediator.Send(queryFolder);
                isCanRead = permissionsFolder.CanRead;
            }

            if (isCanRead)
            {
                var note = await noteRepository.GetNoteWithLabels(request.NoteId);
                if (note.IsLocked)
                {
                    var isUnlocked = userNoteEncryptStorage.IsUnlocked(note.UnlockTime);
                    if (!isUnlocked)
                    {
                        return new OperationResult<FullNote>(false, null).SetContentLocked();
                    }
                }

                if(permissions.Caller != null && !permissions.IsOwner && !permissions.GetAllUsers().Contains(permissions.Caller.Id))
                {
                    await usersOnPrivateNotesRepository.AddAsync(new UserOnPrivateNotes { NoteId = note.Id, AccessTypeId = note.RefTypeId, UserId = permissions.Caller.Id });
                }

                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                var ent = mapperLockedEntities.MapNoteToFullNote(note, permissions.CanWrite);
                return new OperationResult<FullNote>(true, ent);
            }

            return new OperationResult<FullNote>(false, null).SetNoPermissions();
        }

        public async Task<List<OnlineUserOnNote>> Handle(GetOnlineUsersOnNoteQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.NoteNotFound)
            {
                return new List<OnlineUserOnNote>();
            }

            if (permissions.Note.IsLocked)
            {
                var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
                if (!isUnlocked)
                {
                    return new List<OnlineUserOnNote>();
                }
            }

            if (permissions.CanRead)
            {
                var ents = websocketsNotesService.GetEntitiesId(request.Id);
                var unrecognizedUsers = ents.Where(x => !x.UserId.HasValue).Select(x => userBackgroundMapper.MapToOnlineUserOnNote(x));
                var recognizedUsers = ents.Where(x => x.UserId.HasValue).ToList();

                var dict = recognizedUsers.ToDictionary(x => x.UserId);
                var ids = recognizedUsers.Select(x => x.UserId.Value).ToList();
                var users = await userRepository.GetUsersWithPhotos(ids);
                var dbUsers = users.Select(x => userBackgroundMapper.MapToOnlineUserOnNote(x, dict[x.Id].Id));

                return dbUsers.Concat(unrecognizedUsers).ToList();
            }

            return new List<OnlineUserOnNote>();
        }

        public async Task<OperationResult<List<BaseNoteContentDTO>>> Handle(GetNoteContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Note.IsLocked)
            {
                var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
                if (!isUnlocked)
                {
                    return new OperationResult<List<BaseNoteContentDTO>>(false, null).SetContentLocked();
                }
            }

            if (permissions.CanRead)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(request.NoteId);
                var result = appCustomMapper.MapContentsToContentsDTO(contents, permissions.Author.Id);
                return new OperationResult<List<BaseNoteContentDTO>>(true, result);
            }

            return new OperationResult<List<BaseNoteContentDTO>>().SetNoPermissions();
        }

        public async Task<List<SmallNote>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
        {
            var notes = await noteRepository.GetNotesByUserId(request.UserId, request.Settings);
            var sharedNotes = await GetSharedNotes(request.UserId, request.Settings);
            notes.AddRange(sharedNotes);
            notes = notes.DistinctBy(x => x.Id).ToList();

            notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
            notes = notes.OrderBy(x => x.Order).ToList();

            return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
        }

        public async Task<OperationResult<List<SmallNote>>> Handle(GetNotesByNoteIdsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
            var permissions = await _mediator.Send(command);

            var canReadIds = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId);
            if (canReadIds.Any())
            {
                var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(canReadIds, request.Settings);
                notes.ForEach(note =>
                {
                    if(note.UserId != request.UserId)
                    {
                        note.NoteTypeId = NoteTypeENUM.Shared;
                    }
                });

                var result = mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
                return new OperationResult<List<SmallNote>>(true, result);
            }

            return new OperationResult<List<SmallNote>>().SetNotFound();
        }

        public async Task<List<BottomNoteContent>> Handle(GetAdditionalContentNoteInfoQuery request, CancellationToken cancellationToken)
        {
            long GetSize(Guid noteId, params Dictionary<Guid, (Guid, IEnumerable<AppFile>)>[] filesDict)
            {
                return filesDict
                    .Where(x => x.ContainsKey(noteId))
                    .SelectMany(x => x[noteId].Item2)
                    .DistinctBy(x => x.Id)
                    .Sum(x => x.Size);
            }

            var usersOnNotes = await usersOnPrivateNotesRepository.GetByNoteIdsWithUser(request.NoteIds);
            var notesFolder = await foldersNotesRepository.GetByNoteIdsIncludeFolder(request.NoteIds);
            var size = await collectionNoteRepository.GetMemoryOfNotes(request.NoteIds);
            var sizeSnapshots = await noteSnapshotRepository.GetMemoryOfNotesSnapshots(request.NoteIds);

            var usersOnNotesDict = usersOnNotes.ToLookup(x => x.NoteId);
            var notesFolderDict = notesFolder.ToLookup(x => x.NoteId);

            return request.NoteIds.Select(noteId => new BottomNoteContent
            {
                IsHasUserOnNote = usersOnNotesDict.Contains(noteId),
                NoteId = noteId,
                NoteFolderInfos = notesFolderDict.Contains(noteId) ? notesFolderDict[noteId].Select(x => new NoteFolderInfo(x.FolderId, x.Folder.Title)).ToList() : null,
                TotalSize = GetSize(noteId, size, sizeSnapshots)
            }).ToList();
        }
    }

    public static class LabelHelper
    {
        public static List<LabelsNotes> GetLabelUnDesc(this List<LabelsNotes> labels)
        {
            return labels.OrderBy(x => x.AddedAt).ToList();
        }
    }
}