using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using BI.Services.History;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.Notes;
using Domain.Commands.Files;
using Domain.Commands.Notes;
using Domain.Queries.Permissions;
using MediatR;
using Storage;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.Services.Notes
{
    public class NoteHandlerCommand :
        IRequestHandler<NewPrivateNoteCommand, SmallNote>,
        IRequestHandler<ChangeColorNoteCommand, Unit>,
        IRequestHandler<SetDeleteNoteCommand, Unit>,
        IRequestHandler<DeleteNotesCommand, Unit>,
        IRequestHandler<ArchiveNoteCommand, Unit>,
        IRequestHandler<MakePrivateNoteCommand, Unit>,
        IRequestHandler<CopyNoteCommand, List<Guid>>,
        IRequestHandler<MakeNoteHistoryCommand, Unit>,
        IRequestHandler<RemoveLabelFromNoteCommand, Unit>,
        IRequestHandler<AddLabelOnNoteCommand, Unit>
    {

        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly AppCustomMapper noteCustomMapper;
        private readonly LabelsNotesRepository labelsNotesRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly IMediator _mediator;
        private readonly AppSignalRService appSignalRService;
        private readonly HistoryCacheService historyCacheService;
        private readonly NoteSnapshotRepository noteSnapshotRepository;

        public NoteHandlerCommand(
            UserRepository userRepository, NoteRepository noteRepository,
            AppCustomMapper noteCustomMapper, IMediator _mediator, LabelsNotesRepository labelsNotesRepository,
            BaseNoteContentRepository baseNoteContentRepository, AppSignalRService appSignalRService,
            HistoryCacheService historyCacheService, NoteSnapshotRepository noteSnapshotRepository)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.noteCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.labelsNotesRepository = labelsNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.appSignalRService = appSignalRService;
            this.historyCacheService = historyCacheService;
            this.noteSnapshotRepository = noteSnapshotRepository;
        }


        public async Task<SmallNote> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var _contents = new List<BaseNoteContent>();

            var newText = new TextNote { Id = Guid.NewGuid(), Order = 1, NoteTextTypeId = NoteTextTypeENUM.Default };
            _contents.Add(newText);

            var note = new Note()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = NoteColorPallete.Green,
                NoteTypeId = NoteTypeENUM.Private,
                RefTypeId = RefTypeENUM.Viewer,
                CreatedAt = DateTimeOffset.Now,
                UpdatedAt = DateTimeOffset.Now,
                Contents = _contents
            };

            await noteRepository.Add(note, NoteTypeENUM.Private);

            var newNote = await noteRepository.GetOneById(note.Id);
            newNote.LabelsNotes = new List<LabelsNotes>();

            return noteCustomMapper.MapNoteToSmallNoteDTO(newNote);
        }

        public async Task<Unit> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
        {
            foreach (var id in request.Ids)
            {
                var command = new GetUserPermissionsForNoteQuery(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;
                    note.Color = request.Color;
                    note.UpdatedAt = DateTimeOffset.Now;
                    await noteRepository.UpdateAsync(note);

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
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.DeletedAt = DateTimeOffset.Now);
                await noteRepository.CastNotes(notes, user.Notes, notes.FirstOrDefault().NoteTypeId, NoteTypeENUM.Deleted);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var deletednotes = user.Notes.Where(x => x.NoteTypeId == NoteTypeENUM.Deleted).ToList();
            var selectdeletenotes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

            if (selectdeletenotes.Count == request.Ids.Count)
            {
                var contents = await baseNoteContentRepository.GetContentByNoteIds(request.Ids);
                var noteFiles = contents.Where(x => x is PhotosCollectionNote).Select(x => x as PhotosCollectionNote).SelectMany(x => x.Photos).ToList();
                var documents = contents.Where(x => x is DocumentsCollectionNote).Select(x => x as DocumentsCollectionNote).SelectMany(x => x.Documents);
                var audios = contents.Where(x => x is AudiosCollectionNote).Select(x => x as AudiosCollectionNote).SelectMany(x => x.Audios);
                var videos = contents.Where(x => x is VideosCollectionNote).Select(x => x as VideosCollectionNote).SelectMany(x => x.Videos);
                noteFiles.AddRange(documents);
                noteFiles.AddRange(audios);
                noteFiles.AddRange(videos);

                await baseNoteContentRepository.RemoveRangeAsync(contents);
                await noteRepository.DeleteRangeDeleted(selectdeletenotes, deletednotes);

                noteFiles = noteFiles.DistinctBy(x => x.Id).ToList();
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), noteFiles));
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(ArchiveNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.DeletedAt = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, NoteTypeENUM.Archived);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(MakePrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
            var notes = user.Notes.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var note = notes.FirstOrDefault();
            if (notes.Count == request.Ids.Count)
            {
                notes.ForEach(note => note.DeletedAt = null);
                await noteRepository.CastNotes(notes, user.Notes, note.NoteTypeId, NoteTypeENUM.Private);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }


        public async Task<List<BaseNoteContent>> CopyContentAsync(List<BaseNoteContent> noteContents, bool isHistory, Guid entityId, bool isOwner, Guid? authorId, Guid? userId)
        {
            var contents = new List<BaseNoteContent>();

            foreach (var contentForCopy in noteContents)
            {
                switch (contentForCopy)
                {
                    case TextNote textNote:
                        {
                            contents.Add(new TextNote(textNote, isHistory, entityId));
                            continue;
                        }
                    case PhotosCollectionNote collection:
                        {

                            if (isHistory || isOwner)
                            {
                                var dbFiles = collection.PhotoNoteAppFiles?.Select(x => new PhotoNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new PhotosCollectionNote(collection, dbFiles, isHistory, entityId));
                            }
                            else
                            {
                                var copyCommands = collection.Photos?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Photos));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new PhotosCollectionNote(collection, copies, false, entityId));
                            }
                            continue;
                        }
                    case VideosCollectionNote collection:
                        {
                            if (isHistory || isOwner)
                            {
                                var dbFiles = collection.VideoNoteAppFiles?.Select(x => new VideoNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new VideosCollectionNote(collection, dbFiles, isHistory, entityId));
                            }
                            else
                            {
                                var copyCommands = collection.Videos?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Videos));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new VideosCollectionNote(collection, copies, false, entityId));
                            }
                            continue;
                        }
                    case AudiosCollectionNote collection:
                        {
                            if (isHistory || isOwner)
                            {
                                var dbFiles = collection.AudioNoteAppFiles?.Select(x => new AudioNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new AudiosCollectionNote(collection, dbFiles, isHistory, entityId));
                            }
                            else
                            {
                                var copyCommands = collection.Audios?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Audios));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new AudiosCollectionNote(collection, copies, false, entityId));
                            }
                            continue;
                        }
                    case DocumentsCollectionNote collection:
                        {
                            if (isHistory || isOwner)
                            {
                                var dbFiles = collection.DocumentNoteAppFiles?.Select(x => new DocumentNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new DocumentsCollectionNote(collection, dbFiles, isHistory, entityId));
                            }
                            else
                            {
                                var copyCommands = collection.Documents?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Documents));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new DocumentsCollectionNote(collection, copies, false, entityId));
                            }
                            continue;
                        }
                    default:
                        {
                            throw new Exception("Incorrect type");
                        }
                }
            }

            return contents;
        }

        public async Task<List<Guid>> Handle(CopyNoteCommand request, CancellationToken cancellationToken)
        {
            var resultIds = new List<Guid>();
            var order = -1;
            // TODO DO ONE QUERY
            foreach (var id in request.Ids)
            {
                var command = new GetUserPermissionsForNoteQuery(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanRead)
                {
                    var noteForCopy = await noteRepository.GetNoteByIdForCopy(id);
                    var newNote = new Note()
                    {
                        Title = noteForCopy.Title,
                        Color = noteForCopy.Color,
                        CreatedAt = DateTimeOffset.Now,
                        UpdatedAt = DateTimeOffset.Now,
                        NoteTypeId = NoteTypeENUM.Private,
                        RefTypeId = noteForCopy.RefTypeId,
                        Order = order--,
                        UserId = permissions.User.Id,
                    };
                    var dbNote = await noteRepository.AddAsync(newNote);
                    resultIds.Add(dbNote.Entity.Id);
                    var labels = noteForCopy.LabelsNotes.Select(label => new LabelsNotes()
                    {
                        NoteId = dbNote.Entity.Id,
                        LabelId = label.LabelId,
                        AddedAt = DateTimeOffset.Now
                    });

                    await labelsNotesRepository.AddRangeAsync(labels);

                    var contents = await CopyContentAsync(noteForCopy.Contents, false, dbNote.Entity.Id, permissions.IsOwner, permissions.Author.Id, permissions.User.Id);

                    await baseNoteContentRepository.AddRangeAsync(contents);
                }
            }

            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var dbNotes = await noteRepository.GetWhereAsync(x => 
                x.UserId == user.Id 
                && x.NoteTypeId == NoteTypeENUM.Private);

            var orders = Enumerable.Range(1, dbNotes.Count);

            dbNotes = dbNotes.Zip(orders, (note, order) =>
            {
                note.Order = order;
                return note;
            }).ToList();

            return resultIds;
        }

        public async Task<Unit> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
        {
            foreach (var id in request.NoteIds)
            {
                var command = new GetUserPermissionsForNoteQuery(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;

                    var value = await labelsNotesRepository.FirstOrDefaultAsync(x => x.LabelId == request.LabelId && x.NoteId == note.Id);

                    if (value != null)
                    {
                        await labelsNotesRepository.RemoveAsync(value);

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
                var command = new GetUserPermissionsForNoteQuery(id, request.Email);
                var permissions = await _mediator.Send(command);

                if (permissions.CanWrite)
                {
                    var note = permissions.Note;

                    var value = await labelsNotesRepository.FirstOrDefaultAsync(x => x.LabelId == request.LabelId && x.NoteId == note.Id);

                    if (value == null)
                    {
                        var noteLabel = new LabelsNotes() { LabelId = request.LabelId, NoteId = note.Id, AddedAt = DateTimeOffset.Now };

                        await labelsNotesRepository.AddAsync(noteLabel);

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

        public async Task<Unit> Handle(MakeNoteHistoryCommand request, CancellationToken cancellationToken)
        {
            var noteForCopy = await noteRepository.GetNoteByIdForCopy(request.Id);

            var labels = noteForCopy.LabelsNotes.GetLabelUnDesc().Select(x => x.Label).Select(z => new HistoryLabel { Name = z.Name, Color = z.Color }).ToList();

            var snapshot = new NoteSnapshot()
            {
                NoteTypeId = noteForCopy.NoteTypeId,
                RefTypeId = noteForCopy.RefTypeId,
                Title = noteForCopy.Title,
                Color = noteForCopy.Color,
                SnapshotTime = DateTimeOffset.Now,
                NoteId = noteForCopy.Id,
                Labels = labels,
                UserHistories = request.UserIds.Select(x => new UserNoteHistoryManyToMany { UserId = x }).ToList()
            };

            var dbSnapshot = await noteSnapshotRepository.AddAsync(snapshot);

            var contents = await CopyContentAsync(noteForCopy.Contents, true, dbSnapshot.Entity.Id, true, null, null);

            await baseNoteContentRepository.AddRangeAsync(contents);

            return Unit.Value;
        }
    }
}