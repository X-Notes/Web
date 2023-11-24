using Billing.Impl;
using Common;
using Common.Channels;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.Notes.Copy;
using Common.RegexHelpers;
using MediatR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.Files;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Labels;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Editor.Services;
using Noots.Notes.Commands.Copy;
using Noots.Permissions.Queries;
using Noots.Storage.Commands;
using Noots.Storage.Entities;

namespace Noots.Notes.Handlers.Commands.Copy;

public class CopyNotesCommandHandler : IRequestHandler<CopyNotesCommand, OperationResult<Unit>>,
                                       IRequestHandler<CopyNoteInternalCommand, OperationResult<CopyNoteResult>>
{
    private readonly IMediator mediator;    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly NoteRepository noteRepository;
    private readonly LabelsNotesRepository labelsNotesRepository;
    private readonly BaseNoteContentRepository baseNoteContentRepository;
    private readonly CollectionLinkedService collectionLinkedService;
    private readonly BillingPermissionService billingPermissionService;
    private readonly UserRepository userRepository;
    private readonly FileRepository fileRepository;
    private readonly ILogger<CopyNotesCommandHandler> logger;

    public CopyNotesCommandHandler(
        IMediator _mediator,
        FoldersNotesRepository foldersNotesRepository,
        NoteRepository noteRepository,
        LabelsNotesRepository labelsNotesRepository,
        BaseNoteContentRepository baseNoteContentRepository,
        CollectionLinkedService collectionLinkedService,
        BillingPermissionService billingPermissionService,
        UserRepository userRepository,
        FileRepository fileRepository,
        ILogger<CopyNotesCommandHandler> logger)
    {
        mediator = _mediator;
        this.foldersNotesRepository = foldersNotesRepository;
        this.noteRepository = noteRepository;
        this.labelsNotesRepository = labelsNotesRepository;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.collectionLinkedService = collectionLinkedService;
        this.billingPermissionService = billingPermissionService;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
        this.logger = logger;
    }

    public async Task<OperationResult<Unit>> Handle(CopyNotesCommand request, CancellationToken cancellationToken)
    {
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
                return new OperationResult<Unit>().SetNoPermissions();
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
            return new OperationResult<Unit>().SetNotFound();
        }

        var availableNotes = await billingPermissionService.GetAvailableCountNotes(request.UserId);
        if (idsForCopy.Count > availableNotes)
        {
            return new OperationResult<Unit>().SetBillingError();
        }

        var notesWithFiles = await noteRepository.GetNotesIncludeCollectionNoteAppFiles(idsForCopy);
        var externalFiles = notesWithFiles.SelectMany(x => x.Contents)
                                          .Where(x => x.ContentTypeId == ContentTypeENUM.Collection)
                                          .Cast<CollectionNote>()
                                          .SelectMany(x => x.Files)
                                          .Where(x => x.UserId != request.UserId);

        if (externalFiles.Any())
        {
            var size = externalFiles.Sum(x => x.Size);
            var uploadPermission = await mediator.Send(new GetPermissionUploadFileQuery(size, request.UserId));
            if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
            {
                return new OperationResult<Unit>().SetNoEnougnMemory();
            }
        }

        foreach(var noteId in idsForCopy)
        {
            await ChannelsService.CopyNotesChannel.Writer.WriteAsync(new CopyNote { NoteId = noteId, UserId = request.UserId });
        }

        return new OperationResult<Unit>(true, Unit.Value);
    }

 
    public async Task<OperationResult<CopyNoteResult>> Handle(CopyNoteInternalCommand request, CancellationToken cancellationToken)
    {
        var noteForCopy = await noteRepository.GetNoteWithContentAsNoTracking(request.NoteId);

        if (noteForCopy == null)
        {
            return new OperationResult<CopyNoteResult>(false, null);
        }

        var isNoteOwner = noteForCopy.UserId == request.UserId;

        var newNote = new Note()
        {
            Title = !isNoteOwner ? noteForCopy.Title : GetTitle(noteForCopy.Title),
            Color = noteForCopy.Color,
            CreatedAt = DateTimeProvider.Time,
            NoteTypeId = NoteTypeENUM.Private,
            RefTypeId = noteForCopy.RefTypeId,
            UserId = request.UserId,
        };

        newNote.SetDateAndVersion();

        // COPY CONTENTS
        var contents = await CopyContentAsync(noteForCopy.Contents, noteForCopy.UserId, request.UserId);

        if (!contents.success)
        {
            return new OperationResult<CopyNoteResult>(false, null);
        }

        CopyNoteResult res = null;

        // INSERT TO DB

        using var transaction = await noteRepository.context.Database.BeginTransactionAsync();

        try
        {
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

            contents.contents.ForEach(x => x.NoteId = dbNote.Entity.Id);
            await baseNoteContentRepository.AddRangeAsync(contents.contents);

            if (request.FolderId.HasValue)
            {
                var ent = new FoldersNotes { FolderId = request.FolderId.Value, NoteId = dbNote.Entity.Id };
                await foldersNotesRepository.AddAsync(ent);
            }

            // LINK FILES
            var fileIdsToLink = contents.contents.SelectMany(x => x.GetInternalFilesIds()).ToHashSet();
            await collectionLinkedService.TryLink(fileIdsToLink);

            await transaction.CommitAsync();

            res = new CopyNoteResult 
            { 
                NewId = dbNote.Entity.Id,
                PreviousId = request.NoteId, 
                UserId = request.UserId,
                FolderId = request.FolderId
            };
        }
        catch (Exception e)
        {
            logger.LogError(e.ToString());
            await transaction.RollbackAsync();
            return new OperationResult<CopyNoteResult>(false, null);
        }

        return new OperationResult<CopyNoteResult>(true, res);
    }

    private async Task<(bool success, List<BaseNoteContent> contents)> CopyContentAsync(List<BaseNoteContent> noteContents, Guid authorId, Guid callerId)
    {
        var collections = noteContents.Where(x => x.ContentTypeId == ContentTypeENUM.Collection).Cast<CollectionNote>();
        var texts = noteContents.Where(x => x.ContentTypeId == ContentTypeENUM.Text).Cast<TextNote>();

        var copyCollections = await CopyCollectionsAsync(collections, authorId, callerId);

        if (!copyCollections.success)
        {
            return (false, null!);
        }

        var copyTexts = CopyTexts(texts);

        var contents = new List<BaseNoteContent>();
        contents.AddRange(copyTexts);
        contents.AddRange(copyCollections.appFiles);

        return (true, contents);
    }

    private List<TextNote> CopyTexts(IEnumerable<TextNote> texts)
    {
        var res = new List<TextNote>();

        if (texts == null || !texts.Any())
        {
            return res;
        }

        foreach (var text in texts)
        {
            res.Add(new TextNote(text));
        }

        return res;
    }

    private async Task<(bool success, List<CollectionNote> appFiles)> CopyCollectionsAsync(IEnumerable<CollectionNote> collections, Guid authorId, Guid callerId)
    {
        var res = new List<CollectionNote>();

        if (collections == null || !collections.Any())
        {
            return (true, res);
        }

        var isOwner = authorId == callerId;

        if (isOwner)
        {
            foreach (var collection in collections)
            {
                var dbFiles = collection.CollectionNoteAppFiles?.Select(x => new CollectionNoteAppFile
                {
                    AppFileId = x.AppFileId
                }).ToList();
                res.Add(new CollectionNote(collection, dbFiles, 1));
            }
            return (true, res);
        }

        var userFrom = await userRepository.FirstOrDefaultAsync(x => x.Id == authorId);
        var caller = await userRepository.FirstOrDefaultAsync(x => x.Id == callerId);

        if(userFrom == null || caller == null)
        {
            throw new Exception("User not exist");
        }

        foreach (var collection in collections)
        {
            var copyFiles = await CopyFiles(collection.Files!, userFrom, caller, MapToContentTypesFile(collection.FileTypeId));

            if (!copyFiles.success)
            {
                return (false, res);
            }

            if (copyFiles.appFiles.Any())
            {
                await fileRepository.AddRangeAsync(copyFiles.appFiles);
                var collectionNoteAppFiles = copyFiles.appFiles.Select(x => new CollectionNoteAppFile { AppFileId = x.Id }).ToList();
                res.Add(new CollectionNote(collection, collectionNoteAppFiles, 1));
            }
            else
            {
                res.Add(new CollectionNote(collection, new(), 1));
            }
        }

        return (true, res);
    }

    private async Task<(bool success, List<AppFile> appFiles)> CopyFiles(List<AppFile> files, User userFrom, User userTo, ContentTypesFile type)
    {
        if (files == null || !files.Any())
        {
            return (true, new List<AppFile>());
        }

        var copyCommands = files.Select(file => new CopyBlobFromContainerToContainerCommand(userFrom.StorageId, userFrom.Id, userTo.StorageId, userTo.Id, file, type));

        var appFiles = new List<AppFile>();
        foreach (var copyCommand in copyCommands)
        {
            var resp = await mediator.Send(copyCommand);

            if (!resp.success)
            {
                var removeFileCommand = new RemoveFilesFromStorageCommand(appFiles, userTo.Id.ToString());
                await mediator.Send(removeFileCommand);
                return (false, null!);
            }

            appFiles.Add(resp.file);
        }

        return (true, appFiles);
    }

    public ContentTypesFile MapToContentTypesFile(FileTypeEnum fileTypeEnum)
    {
        switch (fileTypeEnum)
        {
            case FileTypeEnum.Photo: return ContentTypesFile.Photos;
            case FileTypeEnum.Video: return ContentTypesFile.Videos;
            case FileTypeEnum.Audio: return ContentTypesFile.Audios;
            case FileTypeEnum.Document: return ContentTypesFile.Documents;
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