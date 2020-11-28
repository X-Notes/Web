using AutoMapper;
using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Common.DTO.labels;
using Common.DTO.notes;
using Common.DTO.users;
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
        IRequestHandler<GetPrivateNotesQuery, List<SmallNote>>,
        IRequestHandler<GetSharedNotesQuery, List<SmallNote>>,
        IRequestHandler<GetArchiveNotesQuery, List<SmallNote>>,
        IRequestHandler<GetDeletedNotesQuery, List<SmallNote>>,

        IRequestHandler<GetFullNoteQuery, FullNoteAnswer>,
        IRequestHandler<GetOnlineUsersOnNote, List<OnlineUserOnNote>>
    {
        private readonly IMapper mapper;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly UserOnNoteRepository userOnNoteRepository;
        public NoteHandlerQuery(IMapper mapper, NoteRepository noteRepository, UserRepository userRepository, UserOnNoteRepository userOnNoteRepository)
        {
            this.mapper = mapper;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.userOnNoteRepository = userOnNoteRepository;
        }
        public async Task<List<SmallNote>> Handle(GetPrivateNotesQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetPrivateNotesByUserId(user.Id);
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                notes = notes.OrderBy(x => x.Order).ToList();
                return mapper.Map<List<SmallNote>>(notes);
            }
            return new List<SmallNote>();
        }

        public async Task<FullNoteAnswer> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null && Guid.TryParse(request.Id, out var guid))
            {
                var note = await noteRepository.GetFull(guid);

                if(note == null)
                {
                    throw new Exception("Note with this id does not exist");
                }

                note.LabelsNotes = note.LabelsNotes.GetLabelUnDesc();
                switch (note.NoteType)
                {
                    case NotesType.Shared:
                        {
                            switch (note.RefType)
                            {
                                case RefType.Editor:
                                    {
                                        return new FullNoteAnswer()
                                        {
                                            CanView = true,
                                            AccessType = RefType.Editor,
                                            FullNote = mapper.Map<FullNote>(note)
                                        };
                                    }
                                case RefType.Viewer:
                                    {
                                        return new FullNoteAnswer()
                                        {
                                            CanView = true,
                                            AccessType = RefType.Viewer,
                                            FullNote = mapper.Map<FullNote>(note)
                                        };
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            if (note.UserId == user.Id)
                            {
                                return new FullNoteAnswer()
                                {
                                    CanView = true,
                                    AccessType = RefType.Editor,
                                    FullNote = mapper.Map<FullNote>(note)
                                };
                            }
                            else
                            {
                                var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == user.Id);
                                if (noteUser != null)
                                {
                                    return new FullNoteAnswer()
                                    {
                                        CanView = true,
                                        AccessType = noteUser.AccessType,
                                        FullNote = mapper.Map<FullNote>(note)
                                    };
                                }
                                else
                                {
                                    return new FullNoteAnswer()
                                    {
                                        CanView = false,
                                        AccessType = null,
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
            if (Guid.TryParse(request.Id, out var guid))
            {
                var users = await userOnNoteRepository.GetUsersOnlineUserOnNote(guid);
                return mapper.Map<List<OnlineUserOnNote>>(users);
            }
            return null;
        }

        public async Task<List<SmallNote>> Handle(GetSharedNotesQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetSharedNotesByUserId(user.Id);
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                notes = notes.OrderBy(x => x.Order).ToList();
                return mapper.Map<List<SmallNote>>(notes);
            }
            return new List<SmallNote>();
        }

        public async Task<List<SmallNote>> Handle(GetArchiveNotesQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetArchiveNotesByUserId(user.Id);
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                notes = notes.OrderBy(x => x.Order).ToList();
                return mapper.Map<List<SmallNote>>(notes);
            }
            return new List<SmallNote>();
        }

        public async Task<List<SmallNote>> Handle(GetDeletedNotesQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var notes = await noteRepository.GetDeletedNotesByUserId(user.Id);
                notes.ForEach(x => x.LabelsNotes = x.LabelsNotes.GetLabelUnDesc());
                notes = notes.OrderBy(x => x.Order).ToList();
                return mapper.Map<List<SmallNote>>(notes);
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
