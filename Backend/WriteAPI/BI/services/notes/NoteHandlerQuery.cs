using AutoMapper;
using BI.Mapping;
using Common.DatabaseModels.models.Labels;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes;
using Common.DTO.notes.FullNoteContent;
using Common.DTO.users;
using Common.Naming;
using Domain.Queries.notes;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.services.notes
{
    public class NoteHandlerQuery :
        IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>,
        IRequestHandler<GetAllNotesQuery, List<SmallNote>>,
        IRequestHandler<GetFullNoteQuery, FullNoteAnswer>,
        IRequestHandler<GetOnlineUsersOnNote, List<OnlineUserOnNote>>,
        IRequestHandler<GetNoteContentsQuery, List<BaseContentNoteDTO>>
    {
        private readonly IMapper mapper;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly UserOnNoteRepository userOnNoteRepository;
        private readonly AppCustomMapper noteCustomMapper;
        private readonly IMediator _mediator;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        public NoteHandlerQuery(
            IMapper mapper, 
            NoteRepository noteRepository, 
            UserRepository userRepository, 
            UserOnNoteRepository userOnNoteRepository,
            AppCustomMapper noteCustomMapper,
            IMediator _mediator,
            BaseNoteContentRepository baseNoteContentRepository)
        {
            this.mapper = mapper;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.userOnNoteRepository = userOnNoteRepository;
            this.noteCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.baseNoteContentRepository = baseNoteContentRepository;
        }
        public async Task<List<SmallNote>> Handle(GetNotesByTypeQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetNotesByUserIdAndTypeId(user.Id, request.TypeId);
                notes.ForEach(x => x.Contents = x.Contents.OrderBy(x => x.Order).ToList());
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                return noteCustomMapper.MapNotesToSmallNotesDTO(notes, takeContentLength: 2);
            }
            return new List<SmallNote>();
        }

        public async Task<FullNoteAnswer> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.Id, request.Email);
            var permissions = await _mediator.Send(command);

            if(permissions.CanWrite)
            {
                var note = await noteRepository.GetFull(request.Id);
                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                return new FullNoteAnswer()
                {
                    CanView = true,
                    CanEdit = true,
                    FullNote = noteCustomMapper.MapNoteToFullNote(note)
                };
            }

            if(permissions.CanRead)
            {
                var note = await noteRepository.GetFull(request.Id);
                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                return new FullNoteAnswer()
                {
                    CanView = true,
                    CanEdit = false,
                    FullNote = noteCustomMapper.MapNoteToFullNote(note)
                };
            }

            return new FullNoteAnswer()
            {
                CanView = false,
                CanEdit = false,
                FullNote = null
            };
        }

        public async Task<List<OnlineUserOnNote>> Handle(GetOnlineUsersOnNote request, CancellationToken cancellationToken)
        {
            var users = await userOnNoteRepository.GetUsersOnlineUserOnNote(request.Id);
            return mapper.Map<List<OnlineUserOnNote>>(users);
        }

        public async Task<List<BaseContentNoteDTO>> Handle(GetNoteContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
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
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetNotesByUserId(user.Id);
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                notes = notes.OrderBy(x => x.Order).ToList();
                return noteCustomMapper.MapNotesToSmallNotesDTO(notes);
            }
            return new List<SmallNote>();
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
