using AutoMapper;
using BI.Mapping;
using Common.DatabaseModels.models;
using Common.DTO.notes;
using Common.DTO.users;
using Common.Naming;
using Domain.Queries.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.notes
{
    public class NoteHandlerQuery :
        IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>,

        IRequestHandler<GetFullNoteQuery, FullNoteAnswer>,
        IRequestHandler<GetOnlineUsersOnNote, List<OnlineUserOnNote>>
    {
        private readonly IMapper mapper;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly UserOnNoteRepository userOnNoteRepository;
        private readonly NoteCustomMapper noteCustomMapper;
        public NoteHandlerQuery(
            IMapper mapper, 
            NoteRepository noteRepository, 
            UserRepository userRepository, 
            UserOnNoteRepository userOnNoteRepository,
            NoteCustomMapper noteCustomMapper)
        {
            this.mapper = mapper;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.userOnNoteRepository = userOnNoteRepository;
            this.noteCustomMapper = noteCustomMapper;
        }
        public async Task<List<SmallNote>> Handle(GetNotesByTypeQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetNotesByUserIdAndTypeId(user.Id, request.TypeId);
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                notes = notes.OrderBy(x => x.Order).ToList();
                return mapper.Map<List<SmallNote>>(notes);
            }
            return new List<SmallNote>();
        }

        public async Task<FullNoteAnswer> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var note = await noteRepository.GetFull(request.Id);

                if(note == null)
                {
                    throw new Exception("Note with this id does not exist");
                }

                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                switch (note.NoteType.Name)
                {
                    case ModelsNaming.SharedNote:
                        {
                            return GetFullNoteByRefTypeName(note, note.RefType.Name);
                        }
                    default:
                        {
                            if (note.UserId == user.Id)
                            {
                                return new FullNoteAnswer()
                                {
                                    CanView = true,
                                    CanEdit = true,
                                    FullNote = noteCustomMapper.TranformNoteToFullNote(note)
                                };
                            }
                            else
                            {
                                var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == user.Id);
                                if (noteUser != null)
                                {
                                    return GetFullNoteByRefTypeName(note, noteUser.AccessType.Name);
                                }
                                else
                                {
                                    return new FullNoteAnswer()
                                    {
                                        CanView = false,
                                        CanEdit = false,
                                        FullNote = null
                                    };
                                }
                            }
                        }
                }
            }
            throw new Exception("Incorrect user data");
        }

        public async Task<List<OnlineUserOnNote>> Handle(GetOnlineUsersOnNote request, CancellationToken cancellationToken)
        {
            var users = await userOnNoteRepository.GetUsersOnlineUserOnNote(request.Id);
            return mapper.Map<List<OnlineUserOnNote>>(users);
        }


        public FullNoteAnswer GetFullNoteByRefTypeName(Note note, string refTypeName)
        {
            switch (refTypeName)
            {
                case ModelsNaming.Editor:
                    {
                        return new FullNoteAnswer()
                        {
                            CanView = true,
                            CanEdit = true,
                            FullNote = noteCustomMapper.TranformNoteToFullNote(note)
                        };
                    }
                case ModelsNaming.Viewer:
                    {
                        return new FullNoteAnswer()
                        {
                            CanView = true,
                            CanEdit = false,
                            FullNote = noteCustomMapper.TranformNoteToFullNote(note)
                        };
                    }
            }
            throw new Exception("Incorrect");
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
