using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using BI.Helpers;
using BI.Mapping;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using Common.DTO.Notes.AdditionalContent;
using Common.DTO.Notes.FullNoteContent;
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
        IRequestHandler<GetAdditionalContentInfoQuery, List<BottomNoteContent>>,
        IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>,
        IRequestHandler<GetNotesByNoteIdsQuery, List<SmallNote>>,
        IRequestHandler<GetAllNotesQuery, List<SmallNote>>,
        IRequestHandler<GetFullNoteQuery, FullNoteAnswer>,
        IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>,
        IRequestHandler<GetNoteContentsQuery, List<BaseContentNoteDTO>>
    {
        private readonly IMapper mapper;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly UserOnNoteRepository userOnNoteRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly AppCustomMapper noteCustomMapper;
        private readonly IMediator _mediator;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;

        public NoteHandlerQuery(
            IMapper mapper,
            NoteRepository noteRepository,
            UserRepository userRepository,
            UserOnNoteRepository userOnNoteRepository,
            AppCustomMapper noteCustomMapper,
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.mapper = mapper;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.userOnNoteRepository = userOnNoteRepository;
            this.noteCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.foldersNotesRepository = foldersNotesRepository;
        }

        public async Task<List<SmallNote>> Handle(GetNotesByTypeQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetNotesByUserIdAndTypeIdWithContentWithPersonalization
                    (user.Id, request.TypeId, request.Settings);

                if (NoteTypeENUM.Shared == request.TypeId)
                {
                    var usersOnPrivateNotes = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.UserId == user.Id);
                    var notesIds = usersOnPrivateNotes.Select(x => x.NoteId);
                    var sharedNotes = await noteRepository.GetNotesByNoteIdsIdWithContentWithPersonalization(notesIds, request.Settings);
                    notes.AddRange(sharedNotes);
                    notes = notes.DistinctBy(x => x.Id).ToList();
                }

                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes?.GetLabelUnDesc());

                return noteCustomMapper.MapNotesToSmallNotesDTO(notes);
            }

            throw new Exception("User not found");
        }

        public async Task<FullNoteAnswer> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = await noteRepository.GetFull(request.Id);
                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                return new FullNoteAnswer(permissions.IsOwner, true, true, note.UserId, noteCustomMapper.MapNoteToFullNote(note));
            }

            if (permissions.CanRead)
            {
                var note = await noteRepository.GetFull(request.Id);
                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                return new FullNoteAnswer(permissions.IsOwner, true, false, note.UserId, noteCustomMapper.MapNoteToFullNote(note));
            }

            return new FullNoteAnswer(permissions.IsOwner, false, false, null, null);
        }

        public async Task<List<OnlineUserOnNote>> Handle(GetOnlineUsersOnNoteQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.Email);
            var permissions = await _mediator.Send(command);
            if (permissions.CanRead)
            {
                var users = await userOnNoteRepository.GetUsersOnlineUserOnNote(request.Id);
                return mapper.Map<List<OnlineUserOnNote>>(users);
            }
            return new List<OnlineUserOnNote>();
        }

        public async Task<List<BaseContentNoteDTO>> Handle(GetNoteContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(request.NoteId);
                return noteCustomMapper.MapContentsToContentsDTO(contents);
            }

            // TODO WHEN NO ACCESS
            return null;
        }

        public async Task<List<SmallNote>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetNotesByUserId(user.Id, request.Settings);
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                notes = notes.OrderBy(x => x.Order).ToList();
                return noteCustomMapper.MapNotesToSmallNotesDTO(notes);
            }

            throw new Exception("User not found");
        }

        public async Task<List<SmallNote>> Handle(GetNotesByNoteIdsQuery request, CancellationToken cancellationToken)
        {
            var canReadIds = new List<Guid>();
            foreach (var noteId in request.NoteIds)
            {
                var command = new GetUserPermissionsForNoteQuery(noteId, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanRead)
                {
                    canReadIds.Add(noteId);
                }
            }

            var notes = await noteRepository.GetNotesByNoteIdsIdWithContentWithPersonalization(canReadIds, request.Settings);

            return noteCustomMapper.MapNotesToSmallNotesDTO(notes);
        }

        public async Task<List<BottomNoteContent>> Handle(GetAdditionalContentInfoQuery request, CancellationToken cancellationToken)
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