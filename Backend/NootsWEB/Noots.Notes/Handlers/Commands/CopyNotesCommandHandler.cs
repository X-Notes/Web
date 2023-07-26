using Common;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.RegexHelpers;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Editor.Services;
using Noots.Notes.Commands;
using Noots.Notes.Entities;
using Noots.Permissions.Queries;
using Noots.Storage.Commands;
using Noots.Storage.Entities;

namespace Noots.Notes.Handlers.Commands;

public class CopyNotesCommandHandler : IRequestHandler<CopyNotesCommand, OperationResult<List<CopyNoteResult>>>,
                                       IRequestHandler<CopyFolderNotesCommand, OperationResult<List<CopyNoteResult>>>
{
    private readonly IMediator mediator;
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly NoteRepository noteRepository;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly BaseNoteContentRepository baseNoteContentRepository;
    private readonly CollectionLinkedService collectionLinkedService;
    private readonly BillingPermissionService billingPermissionService;
    private readonly UserRepository userRepository;

    public CopyNotesCommandHandler(
        IMediator _mediator, 
        FoldersNotesRepository foldersNotesRepository,
        NoteRepository noteRepository,
        LabelsNotesRepository labelsNotesRepository,
        BaseNoteContentRepository baseNoteContentRepository,
        CollectionLinkedService collectionLinkedService,
        BillingPermissionService billingPermissionService,
        UserRepository userRepository)
    {
        mediator = _mediator;
        this.foldersNotesRepository = foldersNotesRepository;
        this.noteRepository = noteRepository;
        this.labelsNotesRepository = labelsNotesRepository;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.collectionLinkedService = collectionLinkedService;
        this.billingPermissionService = billingPermissionService;
        this.userRepository = userRepository;
    }
    
    public async Task<OperationResult<List<CopyNoteResult>>> Handle(CopyNotesCommand request, CancellationToken cancellationToken)
    {
        var results = new List<CopyNoteResult>();

        List<Guid> idsForCopy = new();
        User caller = null;

        if (request.FolderId.HasValue)
        {
            var commandFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
            var permissionFolder = await mediator.Send(commandFolder);
            caller = permissionFolder.Caller;
            if (permissionFolder.CanRead)
            {
                var folderNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId.Value && request.Ids.Contains(x.NoteId));
                idsForCopy = folderNotes.Select(x => x.NoteId).ToList();
            }
            else
            {
                return new OperationResult<List<CopyNoteResult>>().SetNoPermissions();
            }
        }
        else
        {
            var command = new GetUserPermissionsForNotesManyQuery(request.Ids, request.UserId);
            var permissions = await mediator.Send(command);
            idsForCopy = permissions.Where(x => x.perm.CanRead).Select(x => x.noteId).ToList();

            if (permissions.Any())
            {
                caller = permissions.First().perm.Caller;
            }
        }

        if (!idsForCopy.Any() || caller == null)
        {
            return new OperationResult<List<CopyNoteResult>>().SetNotFound();
        }

        var availableNotes = await billingPermissionService.GetAvailableCountNotes(request.UserId);
        if (idsForCopy.Count > availableNotes)
        {
            return new OperationResult<List<CopyNoteResult>>().SetBillingError();
        }

        var notesForCopy = await noteRepository.GetNotesWithContent(idsForCopy);
        foreach (var noteForCopy in notesForCopy)
        {
            var isNoteOwner = noteForCopy.UserId == request.UserId;

            var newNote = new Note()
            {
                Title = GetTitle(noteForCopy.Title),
                Color = noteForCopy.Color,
                CreatedAt = DateTimeProvider.Time,
                NoteTypeId = NoteTypeENUM.Private,
                RefTypeId = noteForCopy.RefTypeId,
                UserId = request.UserId,
            };

            newNote.SetDateAndVersion();
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
            var contents = await CopyContentAsync(noteForCopy.Contents, dbNote.Entity.Id, noteForCopy.UserId, caller);
            await baseNoteContentRepository.AddRangeAsync(contents);

            // LINK FILES
            var fileIdsToLink = contents.SelectMany(x => x.GetInternalFilesIds()).ToHashSet();
            await collectionLinkedService.TryLink(fileIdsToLink);

            var res = new CopyNoteResult { NewId = dbNote.Entity.Id, PreviousId = noteForCopy.Id };
            results.Add(res);
        }

        return new OperationResult<List<CopyNoteResult>>(true, results);
    }

    public async Task<OperationResult<List<CopyNoteResult>>> Handle(CopyFolderNotesCommand request, CancellationToken cancellationToken)
    {
        if (request.Ids == null || !request.Ids.Any())
        {
            return new OperationResult<List<CopyNoteResult>>().SetNotFound();
        }

        var results = new List<CopyNoteResult>();

        var notesForCopy = await noteRepository.GetNotesWithContent(request.Ids);
        foreach (var noteForCopy in notesForCopy)
        {
            var isNoteOwner = noteForCopy.UserId == request.UserId;

            var newNote = new Note()
            {
                Title = noteForCopy.Title,
                Color = noteForCopy.Color,
                CreatedAt = DateTimeProvider.Time,
                NoteTypeId = NoteTypeENUM.Private,
                RefTypeId = noteForCopy.RefTypeId,
                UserId = request.UserId,
            };

            newNote.SetDateAndVersion();

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
            var contents = await CopyContentAsync(noteForCopy.Contents, dbNote.Entity.Id, noteForCopy.UserId, request.Caller);
            await baseNoteContentRepository.AddRangeAsync(contents);

            // LINK FILES
            var fileIdsToLink = contents.SelectMany(x => x.GetInternalFilesIds()).ToHashSet();
            await collectionLinkedService.TryLink(fileIdsToLink);

            var res = new CopyNoteResult { NewId = dbNote.Entity.Id, PreviousId = noteForCopy.Id };
            results.Add(res);
        }

        return new OperationResult<List<CopyNoteResult>>(true, results);
    }


    public async Task<List<BaseNoteContent>> CopyContentAsync(List<BaseNoteContent> noteContents, Guid noteId, Guid authorId, User caller)
    {
        var isOwner = authorId == caller.Id;
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
                            contents.Add(new CollectionNote(collection, dbFiles, noteId, 1));
                        }
                        else
                        {
                            var userFrom = await userRepository.FirstOrDefaultAsync(x => x.Id == authorId);
                            var copyCommands = collection.Files?.Select(file => new CopyBlobFromContainerToContainerCommand(userFrom.StorageId, authorId, caller.StorageId, caller.Id, file, MapToContentTypesFile(collection.FileTypeId)));
                            if(copyCommands != null)
                            {
                                var tasks = copyCommands.Select(x => mediator.Send(x)).ToList();
                                var copies = (await Task.WhenAll(tasks)).ToList();
                                contents.Add(new CollectionNote(collection, copies, noteId, 1));
                            }
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

    private string GetTitle(string title)
    {
        if (string.IsNullOrEmpty(title))
        {
            return null;
        }

        var res = title.EndsWithNumber();
        if (res.end)
        {
            return title.RemoveLastParentheses() + $" ({res.number + 1})";
        }

        return title + " (1)";
    }
}