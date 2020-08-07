using AutoMapper;
using Common;
using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Common.DTO.notes;
using Domain.Commands.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services
{
    public class NoteHandlerCommand : 
        IRequestHandler<NewPrivateNoteCommand, string>,
        IRequestHandler<ChangeColorNoteCommand, Unit>,
        IRequestHandler<SetDeleteNoteCommand, Unit>,
        IRequestHandler<DeleteNotesCommand, Unit>,
        IRequestHandler<RestoreNoteCommand, Unit>,
        IRequestHandler<ArchiveNoteCommand, Unit>,
        IRequestHandler<MakePrivateNoteCommand, Unit>,
        IRequestHandler<MakePublicNoteCommand, Unit>,
        IRequestHandler<CopyNoteCommand, List<SmallNote>>
    {

        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly IMapper mapper;
        public NoteHandlerCommand(UserRepository userRepository, NoteRepository noteRepository, IMapper mapper)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.mapper = mapper;
        }
        public async Task<string> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);

            var note = new Note()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = NoteColorPallete.Green,
                NoteType = NotesType.Private,
                CreatedAt = DateTimeOffset.Now
            };

            await this.noteRepository.Add(note);

            return note.Id.ToString("N");
        }

        public async Task<Unit> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if(notes.Any())
            {
                notes.ForEach(x => x.Color = request.Color);
                await noteRepository.UpdateRangeNotes(notes);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if(notes.Count == request.Ids.Count)
            {
                await noteRepository.CastNotes(notes, user.Notes, request.NoteType, NotesType.Deleted);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var deletednotes = user.Notes.Where(x => x.NoteType == NotesType.Deleted).ToList();
            var selectdeletenotes = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if (selectdeletenotes.Count == request.Ids.Count)
            {
                await noteRepository.DeleteRangeDeleted(selectdeletenotes, deletednotes);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(RestoreNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var deletednotes = user.Notes.Where(x => x.NoteType == NotesType.Deleted).ToList();
            var notesForRestore = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if (notesForRestore.Count == request.Ids.Count)
            {
                await noteRepository.CastNotes(notesForRestore, user.Notes, NotesType.Deleted, NotesType.Private);
            }
            else
            {
                throw new Exception();
            }
            
            return Unit.Value;
        }

        public async Task<Unit> Handle(ArchiveNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if (notes.Count == request.Ids.Count)
            {
                await noteRepository.CastNotes(notes, user.Notes, request.NoteType, NotesType.Archive);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(MakePrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if (notes.Count == request.Ids.Count)
            {
                await noteRepository.CastNotes(notes, user.Notes, request.NoteType, NotesType.Private);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(MakePublicNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if (notes.Count == request.Ids.Count)
            {
                await noteRepository.CastNotes(notes, user.Notes, request.NoteType, NotesType.Shared);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<List<SmallNote>> Handle(CopyNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if (notes.Count == request.Ids.Count)
            {
                var dbnotes =  await noteRepository.CopyNotes(notes, user.Notes, request.NoteType, NotesType.Private);
                return mapper.Map<List<SmallNote>>(dbnotes);
            }
            else
            {
                throw new Exception();
            }
        }
    }
}
