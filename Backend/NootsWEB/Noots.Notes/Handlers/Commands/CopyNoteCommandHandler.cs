using BI.Services.Notes;
using Common;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Encryption.Impl;
using Noots.Notes.Commands;
using Noots.Permissions.Queries;
using Noots.Storage;
using Noots.Storage.Commands;

namespace Noots.Notes.Handlers.Commands;

public class CopyNoteCommandHandler : IRequestHandler<CopyNoteCommand, OperationResult<List<Guid>>>
{
    private readonly IMediator mediator;
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly NoteRepository noteRepository;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly UserNoteEncryptService userNoteEncryptStorage;
    private readonly BaseNoteContentRepository baseNoteContentRepository;
    private readonly CollectionLinkedService collectionLinkedService;
    private readonly BillingPermissionService billingPermissionService;

    public CopyNoteCommandHandler(
        IMediator _mediator, 
        FoldersNotesRepository foldersNotesRepository,
        NoteRepository noteRepository,
        LabelsNotesRepository labelsNotesRepository,
        UserNoteEncryptService userNoteEncryptStorage,
        BaseNoteContentRepository baseNoteContentRepository,
        CollectionLinkedService collectionLinkedService,
        BillingPermissionService billingPermissionService)
    {
        mediator = _mediator;
        this.foldersNotesRepository = foldersNotesRepository;
        this.noteRepository = noteRepository;
        this.labelsNotesRepository = labelsNotesRepository;
        this.userNoteEncryptStorage = userNoteEncryptStorage;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.collectionLinkedService = collectionLinkedService;
        this.billingPermissionService = billingPermissionService;
    }
    
    public async Task<OperationResult<List<Guid>>> Handle(CopyNoteCommand request, CancellationToken cancellationToken)
    {
        var resultIds = new List<Guid>();
        List<Guid> idsForCopy = new();

        if (request.FolderId.HasValue)
        {
            var commandFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
            var permissionFolder = await mediator.Send(commandFolder);

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
            var permissions = await mediator.Send(command);
            idsForCopy = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();
        }

        if (!idsForCopy.Any())
        {
            return new OperationResult<List<Guid>>().SetNotFound();
        }

        var availableNotes = await billingPermissionService.GetAvailableCountNotes(request.UserId);
        if (idsForCopy.Count > availableNotes)
        {
            return new OperationResult<List<Guid>>().SetBillingError();
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
                            var tasks = copyCommands.Select(x => mediator.Send(x)).ToList();
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
}