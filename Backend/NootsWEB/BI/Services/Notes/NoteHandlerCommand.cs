using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.Files;
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
using Domain.Commands.Notes;
using MediatR;
using Noots.Encryption.Impl;
using Noots.History.Impl;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using Noots.Storage;
using Noots.Storage.Commands;
using WriteContext.Repositories.Folders;
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
        IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>,
        IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>,
        IRequestHandler<UpdatePositionsNotesCommand, OperationResult<Unit>>
    {

        private readonly NoteRepository noteRepository;
        private readonly NoteFolderLabelMapper appCustomMapper;
        private readonly LabelsNotesRepository labelsNotesRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly IMediator _mediator;
        private readonly NoteSnapshotRepository noteSnapshotRepository;
        private readonly LabelRepository labelRepository;
        private readonly NoteWSUpdateService noteWSUpdateService;
        private readonly CollectionLinkedService collectionLinkedService;
        private readonly UserNoteEncryptService userNoteEncryptStorage;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly SnapshotFileContentRepository snapshotFileContentRepository;
        private readonly CollectionNoteRepository collectionNoteRepository;
        private readonly HistoryCacheService historyCacheService;

        public NoteHandlerCommand(
            NoteRepository noteRepository,
            NoteFolderLabelMapper noteCustomMapper, 
            IMediator _mediator, 
            LabelsNotesRepository labelsNotesRepository,
            BaseNoteContentRepository baseNoteContentRepository,
            NoteSnapshotRepository noteSnapshotRepository,
            LabelRepository labelRepository, 
            NoteWSUpdateService noteWSUpdateService,
            CollectionLinkedService collectionLinkedService,
            UserNoteEncryptService userNoteEncryptStorage,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            FoldersNotesRepository foldersNotesRepository,
            SnapshotFileContentRepository snapshotFileContentRepository,
            CollectionNoteRepository collectionNoteRepository,
            HistoryCacheService historyCacheService)
        {
            this.noteRepository = noteRepository;
            this.appCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.labelsNotesRepository = labelsNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.noteSnapshotRepository = noteSnapshotRepository;
            this.labelRepository = labelRepository;
            this.noteWSUpdateService = noteWSUpdateService;
            this.collectionLinkedService = collectionLinkedService;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.foldersNotesRepository = foldersNotesRepository;
            this.snapshotFileContentRepository = snapshotFileContentRepository;
            this.collectionNoteRepository = collectionNoteRepository;
            this.historyCacheService = historyCacheService;
        }


        public async Task<SmallNote> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var note = new Note()
            {
                UserId = request.UserId,
                Order = 1,
                Color = NoteColorPallete.Green,
                NoteTypeId = NoteTypeENUM.Private,
                RefTypeId = RefTypeENUM.Viewer,
                CreatedAt = DateTimeProvider.Time,
                UpdatedAt = DateTimeProvider.Time,
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
                var updates = permissions
                    .Where(x => x.perm.IsMultiplyUpdate)
                    .Select(x => ( new UpdateNoteWS { Color = request.Color, NoteId = x.noteId }, x.perm.GetAllUsers()));

                if (updates.Any())
                {
                    await noteWSUpdateService.UpdateNotes(updates, request.UserId);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<List<Guid>>> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var processedIds = new List<Guid>();

            var notesOwner = permissions.Where(x => !x.perm.NoteNotFound && x.perm.IsOwner).Select(x => x.perm.Note).ToList();
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
                var snapshots = await noteSnapshotRepository.GetSnapshotsWithSnapshotFileContent(noteIds);
                var snapshotFileIds = snapshots.SelectMany(x => x.SnapshotFileContents.Select(x => x.AppFileId));

                await noteSnapshotRepository.RemoveRangeAsync(snapshots);

                // CONTENT DELETION
                var collectionsToDelete = await collectionNoteRepository.GetManyIncludeNoteAppFiles(noteIds);
                var collectionFileIds = collectionsToDelete.SelectMany(x => x.CollectionNoteAppFiles.Select(x => x.AppFileId));

                var filesIdsToUnlink = snapshotFileIds.Concat(collectionFileIds).ToHashSet();

                var notesToDelete = notes.Select(x => x.perm.Note);
                await noteRepository.RemoveRangeAsync(notesToDelete);

                await collectionLinkedService.UnlinkFiles(filesIdsToUnlink);

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

        public async Task<List<BaseNoteContent>> CopyContentAsync(List<BaseNoteContent> noteContents, Guid noteId, Guid authorId, Guid callerId)
        {
            var isOwner = authorId == callerId;
            // VIDEO OTHER
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
                                contents.Add(new CollectionNote(collection, dbFiles, noteId));
                            }
                            else
                            {
                                var copyCommands = collection.Files?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId, callerId, file, MapToContentTypesFile(collection.FileTypeId)));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new CollectionNote(collection, copies, noteId));
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
            List<Guid> idsForCopy = new();

            if (request.FolderId.HasValue)
            {
                var commandFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
                var permissionFolder = await _mediator.Send(commandFolder);

                if (permissionFolder.CanRead)
                {
                    var folderNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId.Value && request.Ids.Contains(x.NoteId));
                    idsForCopy = folderNotes.Select(x => x.NoteId).ToList();
                }
                else
                {
                    return new OperationResult<List<Guid>>().SetNoPermissions();
                }
            }
            else
            {
                var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
                var permissions = await _mediator.Send(command);
                idsForCopy = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();
            }

            if (!idsForCopy.Any())
            {
                return new OperationResult<List<Guid>>().SetNotFound();
            }

            var notesForCopy = await noteRepository.GetNotesWithContent(idsForCopy);
            foreach (var noteForCopy in notesForCopy)
            {
                var isNoteOwner = noteForCopy.UserId == request.UserId;

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
                    Title = noteForCopy.Title + " (1)",
                    Color = noteForCopy.Color,
                    CreatedAt = DateTimeProvider.Time,
                    UpdatedAt = DateTimeProvider.Time,
                    NoteTypeId = NoteTypeENUM.Private,
                    RefTypeId = noteForCopy.RefTypeId,
                    UserId = request.UserId,
                };
                var dbNote = await noteRepository.AddAsync(newNote);

                if (isNoteOwner)
                {
                    var labels = noteForCopy.LabelsNotes.Select(label => new LabelsNotes()
                    {
                        NoteId = dbNote.Entity.Id,
                        LabelId = label.LabelId,
                        AddedAt = DateTimeProvider.Time
                    });
                    await labelsNotesRepository.AddRangeAsync(labels);
                }

                // COPY CONTENTS
                var contents = await CopyContentAsync(noteForCopy.Contents, dbNote.Entity.Id, noteForCopy.UserId, request.UserId);
                await baseNoteContentRepository.AddRangeAsync(contents);

                // LINK FILES
                var fileIdsToLink = contents.SelectMany(x => x.GetInternalFilesIds()).ToHashSet();
                await collectionLinkedService.TryLink(fileIdsToLink);

                resultIds.Add(dbNote.Entity.Id);
            }

            return new OperationResult<List<Guid>>(true, resultIds);
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

                    await noteWSUpdateService.UpdateNotes(updates, request.UserId);
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
                            await noteWSUpdateService.UpdateNote(update, value.perm.GetAllUsers(), request.UserId);
                        }
                    }
                }
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
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