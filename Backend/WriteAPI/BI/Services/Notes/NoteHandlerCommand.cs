using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using BI.Services.Encryption;
using BI.Services.History;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.History.Contents;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.WebSockets;
using Domain.Commands.Files;
using Domain.Commands.Notes;
using Domain.Queries.Permissions;
using MediatR;
using Storage;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
namespace BI.Services.Notes
{
    public class NoteHandlerCommand :
        IRequestHandler<NewPrivateNoteCommand, SmallNote>,
        IRequestHandler<ChangeColorNoteCommand, OperationResult<Unit>>,
        IRequestHandler<SetDeleteNoteCommand, OperationResult<List<Guid>>>,
        IRequestHandler<DeleteNotesCommand, OperationResult<Unit>>,
        IRequestHandler<ArchiveNoteCommand, OperationResult<Unit>>,
        IRequestHandler<MakePrivateNoteCommand, OperationResult<Unit>>,
        IRequestHandler<CopyNoteCommand, OperationResult<List<Guid>>>,
        IRequestHandler<MakeNoteHistoryCommand, Unit>,
        IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>,
        IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>,
        IRequestHandler<UpdatePositionsNotesCommand, OperationResult<Unit>>
    {

        private readonly NoteRepository noteRepository;
        private readonly NoteFolderLabelMapper appCustomMapper;
        private readonly LabelsNotesRepository labelsNotesRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly IMediator _mediator;
        private readonly HistoryCacheService historyCacheService;
        private readonly NoteSnapshotRepository noteSnapshotRepository;
        private readonly LabelRepository labelRepository;
        private readonly NoteWSUpdateService noteWSUpdateService;
        private readonly CollectionLinkedService collectionLinkedService;
        private readonly UserNoteEncryptService userNoteEncryptStorage;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

        public NoteHandlerCommand(
            NoteRepository noteRepository,
            NoteFolderLabelMapper noteCustomMapper, 
            IMediator _mediator, 
            LabelsNotesRepository labelsNotesRepository,
            BaseNoteContentRepository baseNoteContentRepository,
            HistoryCacheService historyCacheService, 
            NoteSnapshotRepository noteSnapshotRepository,
            LabelRepository labelRepository, 
            NoteWSUpdateService noteWSUpdateService,
            CollectionLinkedService collectionLinkedService,
            UserNoteEncryptService userNoteEncryptStorage,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository)
        {
            this.noteRepository = noteRepository;
            this.appCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.labelsNotesRepository = labelsNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.historyCacheService = historyCacheService;
            this.noteSnapshotRepository = noteSnapshotRepository;
            this.labelRepository = labelRepository;
            this.noteWSUpdateService = noteWSUpdateService;
            this.collectionLinkedService = collectionLinkedService;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        }


        public async Task<SmallNote> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var _contents = new List<BaseNoteContent>();

            var newText = new TextNote { Id = Guid.NewGuid(), Order = 0, NoteTextTypeId = NoteTextTypeENUM.Default, UpdatedAt = DateTimeProvider.Time };
            _contents.Add(newText); // TODO REMOVE

            var note = new Note()
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Order = 1,
                Color = NoteColorPallete.Green,
                NoteTypeId = NoteTypeENUM.Private,
                RefTypeId = RefTypeENUM.Viewer,
                CreatedAt = DateTimeProvider.Time,
                UpdatedAt = DateTimeProvider.Time,
                Contents = _contents
            };

            await noteRepository.AddAsync(note);
            note.LabelsNotes = new List<LabelsNotes>();

            return appCustomMapper.MapNoteToSmallNoteDTO(note, true);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var isCanEdit = permissions.All(x => x.perm.CanWrite);
            if (isCanEdit)
            {
                var notesForUpdate = permissions.Select(x => x.perm.Note);
                foreach(var note in notesForUpdate)
                {
                    note.Color = request.Color;
                    note.UpdatedAt = DateTimeProvider.Time;
                }

                await noteRepository.UpdateRangeAsync(notesForUpdate);

                // HISTORY
                foreach(var perm in permissions)
                {
                    await historyCacheService.UpdateNote(perm.noteId, perm.perm.Caller.Id);
                }

                // WS UPDATES
                var updates = permissions.Select(x => (
                    new UpdateNoteWS { Color = request.Color, NoteId = x.noteId },
                    x.perm.GetAllUsers()
                ));

                await noteWSUpdateService.UpdateNotes(updates);

                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<List<Guid>>> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var processedIds = new List<Guid>();

            var notesOwner = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Note).ToList();
            if (notesOwner.Any())
            {
                notesOwner.ForEach(x => x.ToType(NoteTypeENUM.Deleted, DateTimeProvider.Time));
                await noteRepository.UpdateRangeAsync(notesOwner);
                processedIds = notesOwner.Select(x => x.Id).ToList();
            }

            var usersOnPrivate = await usersOnPrivateNotesRepository.GetWhereAsync(x => request.UserId == x.UserId && request.Ids.Contains(x.NoteId));
            if (usersOnPrivate.Any())
            {
                await usersOnPrivateNotesRepository.RemoveRangeAsync(usersOnPrivate);
            }

            return new OperationResult<List<Guid>>(true, processedIds);
        }

        public async Task<OperationResult<Unit>> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var notes = permissions.Where(x => x.perm.IsOwner);
            if (notes.Any())
            {
                var noteIds = notes.Select(x => x.noteId);

                // HISTORY DELETION
                var histories = await noteSnapshotRepository.GetWhereAsync(x => noteIds.Contains(x.NoteId));
                await noteSnapshotRepository.RemoveRangeAsync(histories);

                // CONTENT DELETION
                var contentsToDelete = await baseNoteContentRepository.GetWhereAsync(x => noteIds.Contains(x.NoteId));
                var fileContents = contentsToDelete.Where(x => x.ContentTypeId == ContentTypeENUM.Collection).Cast<CollectionNote>();
                if (fileContents.Any())
                {
                    var ids = fileContents.Select(x => x.Id);
                    await collectionLinkedService.UnLinkCollections(ids);
                }

                var notesToDelete = notes.Select(x => x.perm.Note);
                await noteRepository.RemoveRangeAsync(notesToDelete);

                return new OperationResult<Unit>(true, Unit.Value);
            }
 
            return new OperationResult<Unit>().SetNotFound();
        }


        public async Task<OperationResult<Unit>> Handle(ArchiveNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var notes = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Note).ToList();
            if (notes.Any())
            {
                notes.ForEach(x => x.ToType(NoteTypeENUM.Archived));
                await noteRepository.UpdateRangeAsync(notes);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        public async Task<OperationResult<Unit>> Handle(MakePrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var notes = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Note).ToList();
            if (notes.Any())
            {
                notes.ForEach(x => x.ToType(NoteTypeENUM.Private));
                await noteRepository.UpdateRangeAsync(notes);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        public ContentTypesFile MapToContentTypesFile(FileTypeEnum fileTypeEnum) 
        {
            switch (fileTypeEnum)
            {
                case FileTypeEnum.Photo: return ContentTypesFile.Photos;
                case FileTypeEnum.Video : return ContentTypesFile.Videos;
                case FileTypeEnum.Audio : return ContentTypesFile.Audios;
                case FileTypeEnum.Document : return ContentTypesFile.Documents;
            }

            throw new ArgumentException("Incorrect type");
        }

        public async Task<List<BaseNoteContent>> CopyContentAsync(List<BaseNoteContent> noteContents, Guid noteId, bool isOwner, Guid? authorId, Guid? userId)
        {
            var contents = new List<BaseNoteContent>();

            foreach (var contentForCopy in noteContents)
            {
                switch (contentForCopy)
                {
                    case TextNote textNote:
                        {
                            contents.Add(new TextNote(textNote, noteId));
                            continue;
                        }
                    case CollectionNote collection:
                        {
                            if (isOwner)
                            {
                                var dbFiles = collection.CollectionNoteAppFiles?.Select(x => new CollectionNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new CollectionNote(collection, dbFiles, noteId, collection.FileTypeId));
                            }
                            else
                            {
                                var copyCommands = collection.Files?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, MapToContentTypesFile(collection.FileTypeId)));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new CollectionNote(collection, copies, noteId, collection.FileTypeId));
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

        public async Task<OperationResult<List<Guid>>> Handle(CopyNoteCommand request, CancellationToken cancellationToken)
        {
            var resultIds = new List<Guid>();
            var order = -1;

            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Any())
            {
                var idsForCopy = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();
                var permission = permissions.First().perm;
                if (idsForCopy.Any())
                {
                    var notesForCopy = await noteRepository.GetNotesWithContent(idsForCopy);
                    foreach(var noteForCopy in notesForCopy)
                    {

                        if (noteForCopy.IsLocked)
                        {
                            var isUnlocked = userNoteEncryptStorage.IsUnlocked(noteForCopy.UnlockTime);
                            if (!isUnlocked)
                            {
                                continue;
                            }
                        }

                        var newNote = new Note()
                        {
                            Title = noteForCopy.Title,
                            Color = noteForCopy.Color,
                            CreatedAt = DateTimeProvider.Time,
                            UpdatedAt = DateTimeProvider.Time,
                            NoteTypeId = NoteTypeENUM.Private,
                            RefTypeId = noteForCopy.RefTypeId,
                            Order = order--,
                            UserId = permission.Caller.Id,
                        };
                        var dbNote = await noteRepository.AddAsync(newNote);
                        resultIds.Add(dbNote.Entity.Id);
                        var labels = noteForCopy.LabelsNotes.Select(label => new LabelsNotes()
                        {
                            NoteId = dbNote.Entity.Id,
                            LabelId = label.LabelId,
                            AddedAt = DateTimeProvider.Time
                        });

                        await labelsNotesRepository.AddRangeAsync(labels);
                        var contents = await CopyContentAsync(noteForCopy.Contents, dbNote.Entity.Id, permission.IsOwner, permission.Author.Id, permission.Caller.Id);
                        await baseNoteContentRepository.AddRangeAsync(contents);
                    }

                    return new OperationResult<List<Guid>>(true, resultIds);
                }
            }

            return new OperationResult<List<Guid>>(false, resultIds).SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
            var permissions = await _mediator.Send(command);

            var isAuthor = permissions.All(x => x.perm.IsOwner);
            if (isAuthor)
            {
                var noteIds = permissions.Select(x => x.noteId);
                var notes = permissions.Select(x => x.perm.Note).ToList();
                var values = await labelsNotesRepository.GetWhereAsync(x => x.LabelId == request.LabelId && noteIds.Contains(x.NoteId));

                if (values.Any())
                {
                    await labelsNotesRepository.RemoveRangeAsync(values);

                    notes.ForEach(x => x.UpdatedAt = DateTimeProvider.Time);
                    await noteRepository.UpdateRangeAsync(notes);

                    foreach (var perm in permissions)
                    {
                        await historyCacheService.UpdateNote(perm.perm.Note.Id, perm.perm.Caller.Id);
                    }

                    // WS UPDATES
                    var updates = permissions.Select(x => 
                     (new UpdateNoteWS { RemoveLabelIds = new List<Guid> { request.LabelId }, NoteId = x.noteId },
                     x.perm.GetAllUsers()));

                    await noteWSUpdateService.UpdateNotes(updates);
                }
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(AddLabelOnNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.UserId);
            var permissions = await _mediator.Send(command);

            var isAuthor = permissions.All(x => x.perm.IsOwner);
            if (isAuthor)
            {
                var noteIds = permissions.Select(x => x.noteId);
                var notes = permissions.Select(x => x.perm.Note).ToList();
                var existValues = await labelsNotesRepository.GetWhereAsync(x => x.LabelId == request.LabelId && noteIds.Contains(x.NoteId));
                var noteIdsWithLabel = existValues.Select(x => x.NoteId);

                var labelsToAdd = request.NoteIds.Select(id => new LabelsNotes() { LabelId = request.LabelId, NoteId = id, AddedAt = DateTimeProvider.Time });
                labelsToAdd = labelsToAdd.Where(x => !noteIdsWithLabel.Contains(x.NoteId));

                if (labelsToAdd.Any())
                {
                    await labelsNotesRepository.AddRangeAsync(labelsToAdd);

                    notes.ForEach(x => x.UpdatedAt = DateTimeProvider.Time);
                    await noteRepository.UpdateRangeAsync(notes);

                    foreach(var perm in permissions)
                    {
                        await historyCacheService.UpdateNote(perm.perm.Note.Id, perm.perm.Caller.Id);
                    }

                    // WS UPDATES
                    var label = await labelRepository.FirstOrDefaultAsync(x => x.Id == request.LabelId);
                    var labels = appCustomMapper.MapLabelsToLabelsDTO(new List<Label> { label });
                    foreach (var labelNote in labelsToAdd) {
                        var value = permissions.FirstOrDefault(x => x.noteId == labelNote.NoteId);
                        if (value.perm != null) {
                            var update = new UpdateNoteWS { AddLabels = labels, NoteId = value.noteId };
                            await noteWSUpdateService.UpdateNote(update, value.perm.GetAllUsers());
                        }
                    }
                }
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<Unit> Handle(MakeNoteHistoryCommand request, CancellationToken cancellationToken)
        {
            var noteForCopy = await noteRepository.GetNoteWithContent(request.Id);
            var labels = noteForCopy.LabelsNotes.GetLabelUnDesc().Select(x => x.Label).Select(z => new SnapshotNoteLabel { Name = z.Name, Color = z.Color }).ToList();
   
            var snapshot = new NoteSnapshot()
            {
                NoteTypeId = noteForCopy.NoteTypeId,
                RefTypeId = noteForCopy.RefTypeId,
                Title = noteForCopy.Title,
                Color = noteForCopy.Color,
                SnapshotTime = DateTimeProvider.Time,
                NoteId = noteForCopy.Id,
                Labels = labels,
                UserHistories = request.UserIds.Select(x => new UserNoteSnapshotManyToMany { UserId = x }).ToList(),
                SnapshotFileContents = noteForCopy.Contents.SelectMany(x => x.GetInternalFilesIds()).Select(x => new SnapshotFileContent { AppFileId = x }).ToList(),
                Contents = Convert(noteForCopy.Contents)
            };

            var dbSnapshot = await noteSnapshotRepository.AddAsync(snapshot);
            return Unit.Value;
        }

        private ContentSnapshot Convert(List<BaseNoteContent> contents)
        {
            var result = new ContentSnapshot();

            foreach (var content in contents)
            {
                switch (content)
                {
                    case TextNote tN:
                        {
                            var tNDTO = new TextNoteSnapshot(tN.Contents, tN.NoteTextTypeId, tN.HTypeId, tN.Checked, tN.Order, tN.ContentTypeId, tN.UpdatedAt);
                            result.TextNoteSnapshots.Add(tNDTO);
                            break;
                        }
                    case CollectionNote aN:
                        {
                            var fileIds = aN.Files.Select(item => item.Id).ToList();
                            var collectionDTO = new CollectionNoteSnapshot(aN.Name, fileIds, aN.MetaData, aN.FileTypeId, aN.Order, aN.ContentTypeId, aN.UpdatedAt);
                            result.CollectionNoteSnapshots.Add(collectionDTO);
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect type");
                        }
                }
            }
            return result;
        }

        public async Task<OperationResult<Unit>> Handle(UpdatePositionsNotesCommand request, CancellationToken cancellationToken)
        {
            var noteIds = request.Positions.Select(x => x.EntityId).ToList();
            var notes = await noteRepository.GetWhereAsync(x => x.UserId == request.UserId && noteIds.Contains(x.Id));

            if (notes.Any())
            {
                request.Positions.ForEach(x =>
                {
                    var note = notes.FirstOrDefault(z => z.Id == x.EntityId);
                    if (note != null)
                    {
                        note.Order = x.Position;
                    }
                });

                await noteRepository.UpdateRangeAsync(notes);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }
    }
}