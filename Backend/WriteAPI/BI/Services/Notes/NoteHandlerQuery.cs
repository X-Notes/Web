using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using BI.SignalR;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Notes.AdditionalContent;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Personalization;
using Common.DTO.Users;
using Domain.Queries.Notes;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;
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
        IRequestHandler<GetFullNoteQuery, FullNoteAnswer>,
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

        public NoteHandlerQuery(
            NoteRepository noteRepository,
            UserRepository userRepository,
            NoteFolderLabelMapper noteCustomMapper,
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            FoldersNotesRepository foldersNotesRepository,
            WebsocketsNotesServiceStorage websocketsNotesService,
            UserBackgroundMapper userBackgroundMapper)
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
        }

        public async Task<List<SmallNote>> Handle(GetNotesByTypeQuery request, CancellationToken cancellationToken)
        {
            var notes = await noteRepository.GetNotesByUserIdAndTypeIdWithContentWithPersonalization(request.UserId, request.TypeId, request.Settings);

            if (NoteTypeENUM.Shared == request.TypeId)
            {
                var sharedNotes = await GetSharedNotes(request.UserId, request.Settings);
                notes.AddRange(sharedNotes);
                notes = notes.DistinctBy(x => x.Id).ToList();
            }

            notes.ForEach(x => x.LabelsNotes = x.LabelsNotes?.GetLabelUnDesc());
            return appCustomMapper.MapNotesToSmallNotesDTO(notes);
        }

        private async Task<List<Note>> GetSharedNotes(Guid userId, PersonalizationSettingDTO settings)
        {
            var usersOnPrivateNotes = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.UserId == userId);
            var notesIds = usersOnPrivateNotes.Select(x => x.NoteId);
            var sharedNotes = await noteRepository.GetNotesByNoteIdsIdWithContentWithPersonalization(notesIds, settings);
            sharedNotes.ForEach(x => x.NoteTypeId = NoteTypeENUM.Shared);
            return sharedNotes;
        }

        public async Task<FullNoteAnswer> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
        {
            var isCanWrite = false;
            var isCanRead = false;
            var isOwner = false;

            if (request.FolderId.HasValue)
            {
                var command = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
                var permissions = await _mediator.Send(command);
                isCanWrite = permissions.CanWrite;
                isCanRead = permissions.CanRead;
                isOwner = permissions.IsOwner;
            }
            else
            {
                var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
                var permissions = await _mediator.Send(command);
                isCanWrite = permissions.CanWrite;
                isCanRead = permissions.CanRead;
                isOwner = permissions.IsOwner;
            }

            if (isCanWrite)
            {
                var note = await noteRepository.GetFull(request.NoteId);
                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                return new FullNoteAnswer(isOwner, true, true, note.UserId, appCustomMapper.MapNoteToFullNote(note));
            }

            if (isCanRead)
            {
                var note = await noteRepository.GetFull(request.NoteId);
                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                return new FullNoteAnswer(isOwner, true, false, note.UserId, appCustomMapper.MapNoteToFullNote(note));
            }

            return new FullNoteAnswer(isOwner, false, false, null, null);
        }

        public async Task<List<OnlineUserOnNote>> Handle(GetOnlineUsersOnNoteQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command);
            if (permissions.CanRead)
            {
                var ids = websocketsNotesService.GetIdsByEntityId(request.Id);
                var users = await userRepository.GetUsersWithPhotos(ids);
                return users.Select(x => userBackgroundMapper.MapToOnlineUserOnNote(x)).ToList();
            }
            return new List<OnlineUserOnNote>();
        }

        public async Task<OperationResult<List<BaseNoteContentDTO>>> Handle(GetNoteContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

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
            return appCustomMapper.MapNotesToSmallNotesDTO(notes);
        }

        public async Task<OperationResult<List<SmallNote>>> Handle(GetNotesByNoteIdsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
            var permissions = await _mediator.Send(command);

            var canReadIds = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId);
            if (canReadIds.Any())
            {
                var notes = await noteRepository.GetNotesByNoteIdsIdWithContentWithPersonalization(canReadIds, request.Settings);
                notes.ForEach(note =>
                {
                    if(note.UserId != request.UserId)
                    {
                        note.NoteTypeId = NoteTypeENUM.Shared;
                    }
                });
                var result = appCustomMapper.MapNotesToSmallNotesDTO(notes);
                return new OperationResult<List<SmallNote>>(true, result);
            }

            return new OperationResult<List<SmallNote>>().SetNotFound();
        }

        public async Task<List<BottomNoteContent>> Handle(GetAdditionalContentNoteInfoQuery request, CancellationToken cancellationToken)
        {
            var usersOnNotes = await usersOnPrivateNotesRepository.GetByNoteIdsWithUser(request.NoteIds);
            var notesFolder = await foldersNotesRepository.GetByNoteIdsIncludeFolder(request.NoteIds);

            var usersOnNotesDict = usersOnNotes.ToLookup(x => x.NoteId);
            var notesFolderDict = notesFolder.ToLookup(x => x.NoteId);

            return request.NoteIds.Select(noteId => new BottomNoteContent
            {
                IsHasUserOnNote = usersOnNotesDict.Contains(noteId),
                NoteId = noteId,
                NoteFolderInfos = notesFolderDict.Contains(noteId) ? notesFolderDict[noteId].Select(x => new NoteFolderInfo(x.FolderId, x.Folder.Title)).ToList() : null
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