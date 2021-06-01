using AutoMapper;
using BI.Mapping;
using BI.services.history;
using BI.signalR;
using Common;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Labels;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.NoteDict;
using Common.DatabaseModels.models.Notes;
using Common.DTO.files;
using Common.DTO.notes;
using Common.Naming;
using Domain.Commands.files;
using Domain.Commands.notes;
using Domain.Queries.files;
using Domain.Queries.permissions;
using MediatR;
using Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

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
        private readonly LabelRepository labelRepository;
        private readonly AppRepository appRepository;
        private readonly IFilesStorage filesStorage;
        private readonly AppCustomMapper noteCustomMapper;
        private readonly LabelsNotesRepository labelsNotesRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly IMediator _mediator;
        private readonly AppSignalRService appSignalRService;
        private readonly HistoryCacheService historyCacheService;
        public NoteHandlerCommand(
            UserRepository userRepository, NoteRepository noteRepository,
            AppRepository appRepository, IFilesStorage filesStorage, AppCustomMapper noteCustomMapper,
            IMediator _mediator, LabelRepository labelRepository, LabelsNotesRepository labelsNotesRepository,
            BaseNoteContentRepository baseNoteContentRepository, AppSignalRService appSignalRService,
            HistoryCacheService historyCacheService)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.appRepository = appRepository;
            this.filesStorage = filesStorage;
            this.noteCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.labelRepository = labelRepository;
            this.labelsNotesRepository = labelsNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.appSignalRService = appSignalRService;
            this.historyCacheService = historyCacheService;
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
                UpdatedAt = DateTimeOffset.Now,
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
            foreach (var id in request.Ids)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;
                    note.Color = request.Color;
                    note.UpdatedAt = DateTimeOffset.Now;
                    await noteRepository.Update(note);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    var fullNote = await noteRepository.GetFull(note.Id);
                    var noteForUpdating = noteCustomMapper.MapNoteToFullNote(fullNote);
                    await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
                }
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var type = await appRepository.GetNoteTypeByName(ModelsNaming.DeletedNote);
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
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
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
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
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
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
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
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
            var resultIds = new List<Guid>();
            var order = -1;
            foreach (var id in request.Ids)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var noteForCopy = await noteRepository.GetNoteByUserIdAndTypeIdForCopy(id);
                    var newNote = new Note()
                    {
                        Title = noteForCopy.Title,
                        Color = noteForCopy.Color,
                        CreatedAt = DateTimeOffset.Now,
                        UpdatedAt = DateTimeOffset.Now,
                        NoteTypeId = type.Id,
                        RefTypeId = noteForCopy.RefTypeId,
                        Order = order--,
                        UserId = permissions.User.Id,
                        IsHistory = request.IsHistory
                    };
                    var dbNote = await noteRepository.Add(newNote);
                    resultIds.Add(dbNote.Entity.Id);
                    var labels = noteForCopy.LabelsNotes.Select(label => new LabelsNotes()
                    {
                        NoteId = dbNote.Entity.Id,
                        LabelId = label.LabelId,
                        AddedAt = DateTimeOffset.Now
                    });

                    filesStorage.CreateNoteFolders(dbNote.Entity.Id);

                    await labelsNotesRepository.AddRange(labels);

                    var contents = new List<BaseNoteContent>();

                    foreach(var contentForCopy in noteForCopy.Contents)
                    {
                        switch(contentForCopy)
                        {
                            case TextNote textNote:
                                {
                                    contents.Add(new TextNote(textNote, dbNote.Entity.Id));
                                    continue;
                                }
                            case AlbumNote album:
                                {
                                    var files = new List<FilesBytes>();
                                    foreach(var photo in album.Photos)
                                    {
                                        var file = await _mediator.Send(new GetFileById(photo.Id));
                                        files.Add(file);
                                    }
                                    var fileList = await _mediator.Send(new SavePhotosToNoteCommand(files, dbNote.Entity.Id));
                                    var dbFiles = fileList.Select(x => x.AppFile).ToList();

                                    contents.Add(new AlbumNote(album, dbFiles, dbNote.Entity.Id));
                                    continue;
                                }
                            case VideoNote videoNote:
                                {
                                    var file = await _mediator.Send(new GetFileById(videoNote.AppFileId));
                                    var newfile = await _mediator.Send(new SaveVideosToNoteCommand(file, dbNote.Entity.Id));

                                    contents.Add(new VideoNote(videoNote, newfile, dbNote.Entity.Id));
                                    continue;
                                }
                            case AudioNote audioNote:
                                {
                                    var file = await _mediator.Send(new GetFileById(audioNote.AppFileId));
                                    var newfile = await _mediator.Send(new SaveAudiosToNoteCommand(file, dbNote.Entity.Id));

                                    contents.Add(new AudioNote(audioNote, newfile, dbNote.Entity.Id));
                                    continue;
                                }
                            case DocumentNote documentNote:
                                {
                                    var file = await _mediator.Send(new GetFileById(documentNote.AppFileId));
                                    var newfile = await _mediator.Send(new SaveDocumentsToNoteCommand(file, dbNote.Entity.Id));

                                    contents.Add(new DocumentNote(documentNote, newfile, dbNote.Entity.Id));
                                    continue;
                                }
                            default:
                                {
                                    throw new Exception("Incorrect type");
                                }
                        }
                    }
                    await baseNoteContentRepository.AddRange(contents);
                }
            }

            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            var dbNotes = await noteRepository.GetNotesByUserIdAndTypeIdWithContent(user.Id, type.Id, request.IsHistory);

            var orders = Enumerable.Range(1, dbNotes.Count);
            dbNotes = dbNotes.Zip(orders, (note, order) => {
                note.Order = order;
                return note;
            }).ToList();

            await noteRepository.UpdateRange(dbNotes);

            var resultNotes = dbNotes.Where(dbNote => resultIds.Contains(dbNote.Id)).ToList();

            resultNotes.ForEach(note => note.Contents = note.Contents.OrderBy(x => x.Order).ToList());
            return noteCustomMapper.MapNotesToSmallNotesDTO(resultNotes, takeContentLength: 2);
        }

        public async Task<Unit> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
        {
            foreach (var id in request.NoteIds)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;

                    var value = await labelsNotesRepository.FirstOrDefault(x => x.LabelId == request.LabelId && x.NoteId == note.Id);

                    if (value != null)
                    {
                        await labelsNotesRepository.Remove(value);

                        // TODO  MAKE UPDATE NOTE DATE

                        historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                        var fullNote = await noteRepository.GetFull(note.Id);
                        var noteForUpdating = noteCustomMapper.MapNoteToFullNote(fullNote);
                        await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
                    }
                }
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
        {
            foreach (var id in request.NoteIds)
            {
                var command = new GetUserPermissionsForNote(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;

                    var value = await labelsNotesRepository.FirstOrDefault(x => x.LabelId == request.LabelId && x.NoteId == note.Id);

                    if(value == null)
                    {
                        var noteLabel = new LabelsNotes() { LabelId = request.LabelId, NoteId = note.Id, AddedAt = DateTimeOffset.Now };

                        await labelsNotesRepository.Add(noteLabel);

                        // TODO  MAKE UPDATE NOTE DATE

                        historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                        var fullNote = await noteRepository.GetFull(note.Id);
                        var noteForUpdating = noteCustomMapper.MapNoteToFullNote(fullNote);
                        await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
                    }
                }
            }
            return Unit.Value;
        }
    }
}