using AutoMapper;
using BI.Mapping;
using Common;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.NoteDict;
using Common.DTO.notes;
using Common.Naming;
using Domain.Commands.notes;
using MediatR;
using Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.notes
{
    public class NoteHandlerCommand :
        IRequestHandler<NewPrivateNoteCommand, SmallNote>,
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
        private readonly AppRepository appRepository;
        private readonly IFilesStorage filesStorage;
        private readonly NoteCustomMapper noteCustomMapper;
        public NoteHandlerCommand(
            UserRepository userRepository, NoteRepository noteRepository, IMapper mapper,
            AppRepository appRepository, IFilesStorage filesStorage, NoteCustomMapper noteCustomMapper)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.mapper = mapper;
            this.appRepository = appRepository;
            this.filesStorage = filesStorage;
            this.noteCustomMapper = noteCustomMapper;
        }
        public async Task<SmallNote> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            var type = await appRepository.GetNoteTypeByName(ModelsNaming.PrivateNote);
            var refType = await appRepository.GetRefTypeByName(ModelsNaming.Viewer);

            var textType = TextNoteTypesDictionary.GetValueFromDictionary(TextNoteTypes.DEFAULT);
            var _contents = new List<BaseNoteContent>();

            var newText = new TextNote {  Id = Guid.NewGuid(), Order = 1, TextType = textType };
            _contents.Add(newText);

            var note = new Note()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = NoteColorPallete.Green,
                NoteTypeId = type.Id,
                RefTypeId = refType.Id,
                CreatedAt = DateTimeOffset.Now,
                Contents = _contents
            };

            await noteRepository.Add(note, type.Id);

            filesStorage.CreateNoteFolders(note.Id);

            var newNote = await noteRepository.GetOneById(note.Id);
            newNote.LabelsNotes = new List<LabelsNotes>();

            return noteCustomMapper.MapNoteToSmallNoteDTO(newNote);
        }

        public async Task<Unit> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

            if (notes.Any())
            {
                notes.ForEach(x => x.Color = request.Color);
                await noteRepository.UpdateRange(notes);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var type = await appRepository.GetNoteTypeByName(ModelsNaming.DeletedNote);
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                user.Notes.ForEach(x => x.DeletedAt = DateTimeOffset.Now);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, type.Id);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
        {
            var type = await appRepository.GetNoteTypeByName(ModelsNaming.DeletedNote);
            var user = await userRepository.GetUserWithNotes(request.Email);
            var deletednotes = user.Notes.Where(x => x.NoteTypeId == type.Id).ToList();
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
            var type = await appRepository.GetNoteTypeByName(ModelsNaming.ArchivedNote);
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, type.Id);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(MakePrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var type = await appRepository.GetNoteTypeByName(ModelsNaming.PrivateNote);
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.RefType = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, type.Id);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<List<SmallNote>> Handle(CopyNoteCommand request, CancellationToken cancellationToken)
        {
            var type = await appRepository.GetNoteTypeByName(ModelsNaming.PrivateNote);
            var user = await userRepository.GetUserWithNotes(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                var dbnotes = await noteRepository.CopyNotes(notes, user.Notes, note.NoteTypeId, type.Id);
                return mapper.Map<List<SmallNote>>(dbnotes);
            }
            else
            {
                throw new Exception();
            }
        }

        public async Task<Unit> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            var notes = await noteRepository.GetNotesWithLabelsByUserId(user.Id);

            var selectedNotes = notes.Where(x => request.NoteIds.Any(z => z == x.Id)).ToList();

            var noteWithLabels = selectedNotes.Where(x => x.LabelsNotes.Any(z => z.LabelId == request.LabelId)).ToList();

            noteWithLabels.ForEach(x => x.LabelsNotes = x.LabelsNotes.Where(x => x.LabelId != request.LabelId).ToList());

            await noteRepository.UpdateRange(noteWithLabels);

            return Unit.Value;
        }

        public async Task<Unit> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            var notes = await noteRepository.GetNotesWithLabelsByUserId(user.Id);

            var selectedNotes = notes.Where(x => request.NoteIds.Any(z => z == x.Id)).ToList();

            var noteWithoutLabels = selectedNotes.Where(x => x.LabelsNotes.Any(z => z.LabelId != request.LabelId) || x.LabelsNotes.Count == 0).ToList();

            noteWithoutLabels.ForEach(x => x.LabelsNotes.Add(new LabelsNotes() { LabelId = request.LabelId, NoteId = x.Id, AddedAt = DateTimeOffset.Now }));;

            await noteRepository.UpdateRange(noteWithoutLabels);

            return Unit.Value;
        }
    }
}