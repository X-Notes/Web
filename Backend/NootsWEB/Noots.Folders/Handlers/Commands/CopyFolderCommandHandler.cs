using Billing.Impl;
using Common;
using Common.Channels;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Notes.Copy;
using Common.RegexHelpers;
using DatabaseContext.Repositories.Folders;
using DatabaseContext.Repositories.Notes;
using Folders.Commands;
using Folders.Entities;
using Mapper.Mapping;
using MediatR;
using Permissions.Queries;

namespace Folders.Handlers.Commands;

public class CopyFolderCommandHandler : IRequestHandler<CopyFolderCommand, OperationResult<CopyFoldersResult>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    private readonly NoteRepository noteRepository;
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly BillingPermissionService billingPermissionService;

    public CopyFolderCommandHandler(
        IMediator mediator, 
        FolderRepository folderRepository,
        NoteRepository noteRepository,
        FoldersNotesRepository foldersNotesRepository,
        NoteFolderLabelMapper appCustomMapper,
        BillingPermissionService billingPermissionService)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
        this.noteRepository = noteRepository;
        this.foldersNotesRepository = foldersNotesRepository;
        this.appCustomMapper = appCustomMapper;
        this.billingPermissionService = billingPermissionService;
    }
    
    public async Task<OperationResult<CopyFoldersResult>> Handle(CopyFolderCommand request, CancellationToken cancellationToken)
    {
        var resultIds = new List<Guid>();

        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var idsForCopy = permissions.Where(x => x.perm.CanRead).Select(x => x.folderId).ToList();
        
        if (!idsForCopy.Any())
        {
            return new OperationResult<CopyFoldersResult>().SetNotFound();
        }

        var availableFolders = await billingPermissionService.GetAvailableCountFolders(request.UserId);
        if (idsForCopy.Count > availableFolders)
        {
            return new OperationResult<CopyFoldersResult>().SetBillingError();
        }
        
        var foldersForCopy = await folderRepository.GetFoldersByIdsIncludeNotes(idsForCopy);
        var foldersNotes = foldersForCopy.SelectMany(x => x.FoldersNotes).ToList();

        var notesToCopy = foldersNotes.DistinctBy(x => x.NoteId).Where(x => x.Note.UserId != request.UserId);
        var notesToCopyCount = notesToCopy.Count();
        var notesToCopyDict = notesToCopy.ToDictionary(x => x.NoteId);

        if (notesToCopyCount > 0)
        {
            var availableNotes = await billingPermissionService.GetAvailableCountNotes(request.UserId);
            if (notesToCopyCount > availableNotes)
            {
                return new OperationResult<CopyFoldersResult>().SetBillingError();
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
                    return new OperationResult<CopyFoldersResult>().SetNoEnougnMemory();
                }
            }
        }

        var dbFolders = await CopyFoldersAsync(foldersForCopy, request.UserId);

        var folderNotes = dbFolders.SelectMany(folder => folder.NoteIds.Where(id => !notesToCopyDict.ContainsKey(id)).Select(noteId => new FoldersNotes()
        {
            FolderId = folder.Id,
            NoteId = noteId
        }));

        await foldersNotesRepository.AddRangeAsync(folderNotes);

        var folderIds = dbFolders.Select(x => x.Id).ToList();
        var resultFolders = await folderRepository.GetFoldersIncludeNote(request.UserId, folderIds);
        
        var ents = appCustomMapper.MapFoldersToSmallFolders(resultFolders, request.UserId);
        var result = new CopyFoldersResult
        {
            Folders = ents,
            NoteIds = notesToCopyDict.Keys.ToList()
        };

        foreach(var newFolder in dbFolders)
        {
            var folderNotesToCopy = notesToCopy.Where(x => x.FolderId == newFolder.PrevId).ToList();
            if (folderNotesToCopy.Any())
            {
                await CopyNotes(request.UserId, newFolder.Id, folderNotesToCopy);
            }
        }

        return new OperationResult<CopyFoldersResult>(true, result);
    }

    private async Task CopyNotes(Guid userId, Guid folderId, List<FoldersNotes> folderNotesToCopy)
    {
        if(folderNotesToCopy == null)
        {
            return;
        }

        foreach(var folderNote in folderNotesToCopy)
        {
            var ent = new CopyNote { NoteId = folderNote.NoteId, UserId = userId, FolderId = folderId };
            await ChannelsService.CopyNotesChannel.Writer.WriteAsync(ent);
        }
    }


    private async Task<List<Folder>> CopyFoldersAsync(List<Folder> folders, Guid userId)
    {
        var foldersToSave = folders.Select(x =>
        {
            var folder = new Folder()
            {
                Title = GetTitle(x.Title),
                Color = x.Color,
                FolderTypeId = FolderTypeENUM.Private,
                RefTypeId = RefTypeENUM.Viewer,
                CreatedAt = DateTimeProvider.Time,
                UserId = userId,
                NoteIds = x.FoldersNotes.Select(x => x.NoteId).ToList(),
                PrevId = x.Id
            };
            folder.SetDateAndVersion();
            return folder;
        }).ToList();

        await folderRepository.AddRangeAsync(foldersToSave);

        return foldersToSave;
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