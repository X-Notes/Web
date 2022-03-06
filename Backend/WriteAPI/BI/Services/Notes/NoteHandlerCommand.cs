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
using Common.DatabaseModels.Models.History.Contents;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.WebSockets;
using Domain.Commands.Files;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Commands.NoteInner.FileContent.Videos;
using Domain.Commands.Notes;
using Domain.Queries.Permissions;
using MediatR;
using Storage;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.Labels;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.Services.Notes
{
    public class NoteHandlerCommand :
        IRequestHandler<NewPrivateNoteCommand, SmallNote>,
        IRequestHandler<ChangeColorNoteCommand, OperationResult<Unit>>,
        IRequestHandler<SetDeleteNoteCommand, OperationResult<Unit>>,
        IRequestHandler<DeleteNotesCommand, OperationResult<Unit>>,
        IRequestHandler<ArchiveNoteCommand, OperationResult<Unit>>,
        IRequestHandler<MakePrivateNoteCommand, OperationResult<Unit>>,
        IRequestHandler<CopyNoteCommand, List<Guid>>,
        IRequestHandler<MakeNoteHistoryCommand, Unit>,
        IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>,
        IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>
    {

        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly AppCustomMapper appCustomMapper;
        private readonly LabelsNotesRepository labelsNotesRepository;
        private readonly BaseNoteContentRepository baseNoteContentRepository;
        private readonly IMediator _mediator;
        private readonly HistoryCacheService historyCacheService;
        private readonly NoteSnapshotRepository noteSnapshotRepository;
        private readonly LabelRepository labelRepository;
        private readonly NoteWSUpdateService noteWSUpdateService;
        private readonly FileRepository fileRepository;
        private readonly CollectionLinkedService collectionLinkedService;
        public NoteHandlerCommand(
            UserRepository userRepository, 
            NoteRepository noteRepository,
            AppCustomMapper noteCustomMapper, 
            IMediator _mediator, 
            LabelsNotesRepository labelsNotesRepository,
            BaseNoteContentRepository baseNoteContentRepository,
            HistoryCacheService historyCacheService, 
            NoteSnapshotRepository noteSnapshotRepository,
            LabelRepository labelRepository, 
            NoteWSUpdateService noteWSUpdateService,
            FileRepository fileRepository,
            CollectionLinkedService collectionLinkedService)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.appCustomMapper = noteCustomMapper;
            this._mediator = _mediator;
            this.labelsNotesRepository = labelsNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.historyCacheService = historyCacheService;
            this.noteSnapshotRepository = noteSnapshotRepository;
            this.labelRepository = labelRepository;
            this.noteWSUpdateService = noteWSUpdateService;
            this.fileRepository = fileRepository;
            this.collectionLinkedService = collectionLinkedService;
        }


        public async Task<SmallNote> Handle(NewPrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var _contents = new List<BaseNoteContent>();

            var newText = new TextNote { Id = Guid.NewGuid(), Order = 0, NoteTextTypeId = NoteTextTypeENUM.Default, UpdatedAt = DateTimeProvider.Time };
            _contents.Add(newText);

            var note = new Note()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = NoteColorPallete.Green,
                NoteTypeId = NoteTypeENUM.Private,
                RefTypeId = RefTypeENUM.Viewer,
                CreatedAt = DateTimeProvider.Time,
                UpdatedAt = DateTimeProvider.Time,
                Contents = _contents
            };

            await noteRepository.Add(note, NoteTypeENUM.Private);

            var newNote = await noteRepository.GetOneById(note.Id);
            newNote.LabelsNotes = new List<LabelsNotes>();

            return appCustomMapper.MapNoteToSmallNoteDTO(newNote);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeColorNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.Email);
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
                    historyCacheService.UpdateNote(perm.noteId, perm.perm.User.Id, perm.perm.Author.Email);
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

        public async Task<OperationResult<Unit>> Handle(SetDeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.Email);
            var permissions = await _mediator.Send(command);

            var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);;
            var isCanDelete = permissions.All(x => x.perm.IsOwner);
            if (isCanDelete)
            {
                var notes = permissions.Select(x => x.perm.Note).ToList();
                notes.ForEach(note => note.DeletedAt = DateTimeProvider.Time);
                await noteRepository.CastNotes(notes, user.Notes, notes.FirstOrDefault().NoteTypeId, NoteTypeENUM.Deleted);
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(DeleteNotesCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.Email);
            var permissions = await _mediator.Send(command);

            var isCanDelete = permissions.All(x => x.perm.IsOwner);
            if (isCanDelete)
            {
                var contentsToDelete = await baseNoteContentRepository.GetWhereAsync(x => request.Ids.Contains(x.NoteId));
                await collectionLinkedService.UnlinkAndRemoveFileItems(contentsToDelete, Guid.Empty, request.Email, false);

                var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email); // TODO REFACTOR
                var deletednotes = user.Notes.Where(x => x.NoteTypeId == NoteTypeENUM.Deleted).ToList();
                var selectdeletenotes = permissions.Select(x => x.perm.Note).ToList();
                await noteRepository.DeleteRangeDeleted(selectdeletenotes, deletednotes);

                return new OperationResult<Unit>(true, Unit.Value);
            }
            // TODO REMOVE ORDER 
            return new OperationResult<Unit>().SetNotFound();
        }


        public async Task<OperationResult<Unit>> Handle(ArchiveNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.Email);
            var permissions = await _mediator.Send(command);

            var isCanDelete = permissions.All(x => x.perm.IsOwner);
            if (isCanDelete)
            {
                var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
                var notes = permissions.Select(x => x.perm.Note).ToList();
                notes.ForEach(note => note.DeletedAt = null);
                await noteRepository.CastNotes(notes, user.Notes, notes.FirstOrDefault().NoteTypeId, NoteTypeENUM.Archived);
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(MakePrivateNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.Email);
            var permissions = await _mediator.Send(command);

            var isCanDelete = permissions.All(x => x.perm.IsOwner);
            if (isCanDelete)
            {
                var user = await userRepository.GetUserWithNotesIncludeNoteType(request.Email);
                var notes = permissions.Select(x => x.perm.Note).ToList();
                notes.ForEach(note => note.DeletedAt = null);
                await noteRepository.CastNotes(notes, user.Notes, notes.FirstOrDefault().NoteTypeId, NoteTypeENUM.Private);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
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
                    case PhotosCollectionNote collection:
                        {
                            if (isOwner)
                            {
                                var dbFiles = collection.PhotoNoteAppFiles?.Select(x => new PhotoNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new PhotosCollectionNote(collection, dbFiles, noteId));
                            }
                            else
                            {
                                var copyCommands = collection.Photos?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Photos));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new PhotosCollectionNote(collection, copies, noteId));
                            }
                            continue;
                        }
                    case VideosCollectionNote collection:
                        {
                            if (isOwner)
                            {
                                var dbFiles = collection.VideoNoteAppFiles?.Select(x => new VideoNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new VideosCollectionNote(collection, dbFiles, noteId));
                            }
                            else
                            {
                                var copyCommands = collection.Videos?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Videos));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new VideosCollectionNote(collection, copies, noteId));
                            }
                            continue;
                        }
                    case AudiosCollectionNote collection:
                        {
                            if (isOwner)
                            {
                                var dbFiles = collection.AudioNoteAppFiles?.Select(x => new AudioNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new AudiosCollectionNote(collection, dbFiles, noteId));
                            }
                            else
                            {
                                var copyCommands = collection.Audios?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Audios));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new AudiosCollectionNote(collection, copies, noteId));
                            }
                            continue;
                        }
                    case DocumentsCollectionNote collection:
                        {
                            if (isOwner)
                            {
                                var dbFiles = collection.DocumentNoteAppFiles?.Select(x => new DocumentNoteAppFile
                                {
                                    AppFileId = x.AppFileId
                                }).ToList();
                                contents.Add(new DocumentsCollectionNote(collection, dbFiles, noteId));
                            }
                            else
                            {
                                var copyCommands = collection.Documents?.Select(file => new CopyBlobFromContainerToContainerCommand(authorId.Value, userId.Value, file, ContentTypesFile.Documents));
                                var tasks = copyCommands.Select(x => _mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new DocumentsCollectionNote(collection, copies, noteId));
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

            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.Any())
            {
                var idsForCopy = permissions.Where(x => x.Item2.CanRead).Select(x => x.Item1).ToList();
                var permission = permissions.First().Item2;
                if (idsForCopy.Any())
                {
                    var notesForCopy = await noteRepository.GetNotesByIdsForCopy(idsForCopy);
                    foreach(var noteForCopy in notesForCopy)
                    {
                        var newNote = new Note()
                        {
                            Title = noteForCopy.Title,
                            Color = noteForCopy.Color,
                            CreatedAt = DateTimeProvider.Time,
                            UpdatedAt = DateTimeProvider.Time,
                            NoteTypeId = NoteTypeENUM.Private,
                            RefTypeId = noteForCopy.RefTypeId,
                            Order = order--,
                            UserId = permission.User.Id,
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
                        var contents = await CopyContentAsync(noteForCopy.Contents, dbNote.Entity.Id, permission.IsOwner, permission.Author.Id, permission.User.Id);
                        await baseNoteContentRepository.AddRangeAsync(contents);
                    }

                    var dbNotes = await noteRepository.GetWhereAsync(x => x.UserId == permission.User.Id && x.NoteTypeId == NoteTypeENUM.Private);
                    var orders = Enumerable.Range(1, dbNotes.Count);
                    dbNotes = dbNotes.OrderBy(x => x.Order).Zip(orders, (note, order) =>
                    {
                        note.Order = order;
                        return note;
                    }).ToList();

                    await noteRepository.UpdateRangeAsync(dbNotes);
                }
            }

            return resultIds;
        }

        public async Task<OperationResult<Unit>> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.Email);
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

                    permissions.ForEach(x =>
                    {
                        historyCacheService.UpdateNote(x.perm.Note.Id, x.perm.User.Id, x.perm.Author.Email);
                    });

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
            var command = new GetUserPermissionsForNotesManyQuery(request.NoteIds, request.Email);
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

                    permissions.ForEach(x =>
                    {
                        historyCacheService.UpdateNote(x.perm.Note.Id, x.perm.User.Id, x.perm.Author.Email);
                    });

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
            var noteForCopy = await noteRepository.GetNoteByIdsForCopy(request.Id);
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
                    case PhotosCollectionNote aN:
                        {
                            var photoFileIds = aN.Photos.Select(item => item.Id).ToList();
                            var collectionDTO = new PhotosCollectionNoteSnapshot(aN.Name, aN.Width, aN.Height, aN.CountInRow, photoFileIds, 
                                aN.Order, aN.ContentTypeId, aN.UpdatedAt);
                            result.PhotosCollectionNoteSnapshots.Add(collectionDTO);
                            break;
                        }
                    case AudiosCollectionNote playlistNote:
                        {
                            var audioFileIds = playlistNote.Audios.Select(item => item.Id).ToList();
                            var collectionDTO = new AudiosCollectionNoteSnapshot(playlistNote.Name, audioFileIds,
                                playlistNote.Order, playlistNote.ContentTypeId, playlistNote.UpdatedAt);
                            result.AudiosCollectionNoteSnapshots.Add(collectionDTO);
                            break;
                        }
                    case VideosCollectionNote videoNote:
                        {
                            var videoFileIds = videoNote.Videos.Select(item => item.Id).ToList();
                            var collectionDTO = new VideosCollectionNoteSnapshot(videoNote.Name, videoFileIds,
                                videoNote.Order, videoNote.ContentTypeId, videoNote.UpdatedAt);
                            result.VideosCollectionNoteSnapshots.Add(collectionDTO);
                            break;
                        }
                    case DocumentsCollectionNote documentNote:
                        {
                            var documentFileIds = documentNote.Documents.Select(item => item.Id).ToList();
                            var collectionDTO = new DocumentsCollectionNoteSnapshot(documentNote.Name, documentFileIds,
                                documentNote.Order, documentNote.ContentTypeId, documentNote.UpdatedAt);
                            result.DocumentsCollectionNoteSnapshots.Add(collectionDTO);
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
    }
}