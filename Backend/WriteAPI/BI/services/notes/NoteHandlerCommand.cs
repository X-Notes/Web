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

namespace BI.services.notes
{
    public class NoteHandlerCommand :
        IRequestHandler<NewPrivateNoteCommand, string>,
        IRequestHandler<ChangeColorNoteCommand, Unit>,
        IRequestHandler<SetDeleteNoteCommand, Unit>,
        IRequestHandler<DeleteNotesCommand, Unit>,
        IRequestHandler<ArchiveNoteCommand, Unit>,
        IRequestHandler<MakePrivateNoteCommand, Unit>,
        IRequestHandler<CopyNoteCommand, List<SmallNote>>,
        IRequestHandler<RemoveLabelFromNoteCommand, Unit>,
        IRequestHandler<AddLabelOnNoteCommand, Unit>
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

            await noteRepository.Add(note);

            return note.Id.ToString("N");
        }

        public async Task<Unit> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

            if (notes.Any())
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
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                user.Notes.ForEach(x => x.DeletedAt = DateTimeOffset.Now);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteType, NotesType.Deleted);
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
            var selectdeletenotes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

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

        public async Task<Unit> Handle(ArchiveNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteType, NotesType.Archive);
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
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteType, NotesType.Private);
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
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                var dbnotes = await noteRepository.CopyNotes(notes, user.Notes, note.NoteType, NotesType.Private);
                return mapper.Map<List<SmallNote>>(dbnotes);
            }
            else
            {
                throw new Exception();
            }
        }

        public async Task<Unit> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            var notes = await noteRepository.GetNotesWithLabelsByUserId(user.Id);

            var selectedNotes = notes.Where(x => request.NoteIds.Any(z => z == x.Id)).ToList();

            var noteWithLabels = selectedNotes.Where(x => x.LabelsNotes.Any(z => z.LabelId == request.LabelId)).ToList();

            noteWithLabels.ForEach(x => x.LabelsNotes = x.LabelsNotes.Where(x => x.LabelId != request.LabelId).ToList());

            await noteRepository.UpdateRangeNotes(noteWithLabels);

            return Unit.Value;
        }

        public async Task<Unit> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            var notes = await noteRepository.GetNotesWithLabelsByUserId(user.Id);

            var selectedNotes = notes.Where(x => request.NoteIds.Any(z => z == x.Id)).ToList();

            var noteWithoutLabels = selectedNotes.Where(x => x.LabelsNotes.Any(z => z.LabelId != request.LabelId) || x.LabelsNotes.Count == 0).ToList();

            noteWithoutLabels.ForEach(x => x.LabelsNotes.Add(new LabelsNotes() { LabelId = request.LabelId, NoteId = x.Id, AddedAt = DateTimeOffset.Now }));;

            await noteRepository.UpdateRangeNotes(noteWithoutLabels);

            return Unit.Value;
        }
    }
}