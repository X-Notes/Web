using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Folders;
using Common.RegexHelpers;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Folders.Commands;
using Noots.Folders.Entities;
using Noots.Mapper.Mapping;
using Noots.Notes.Commands;
using Noots.Notes.Entities;
using Noots.Permissions.Queries;

namespace Noots.Folders.Handlers.Commands;

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
        
        var foldersForCopy = await folderRepository.GetFoldersByIdsForCopy(idsForCopy);
        var foldersNotes = foldersForCopy.SelectMany(x => x.FoldersNotes).ToList();
        Dictionary<Guid, CopyNoteResult> copyResults = new();

        if (foldersNotes.Any())
        {
            var noteIds = foldersNotes.Select(x => x.NoteId).Distinct();
            var dbNotes = await noteRepository.GetManyAsync(noteIds);
            var notesToCopy = dbNotes.Where(x => x.UserId != request.UserId).ToList();

            if (notesToCopy.Any())
            {
                var availableNotes = await billingPermissionService.GetAvailableCountNotes(request.UserId);
                if (notesToCopy.Count > availableNotes)
                {
                    return new OperationResult<CopyFoldersResult>().SetBillingError();
                }

                var noteCopyIds = notesToCopy.Select(x => x.Id).ToList();
                var caller = permissions.First().perm.Caller;
                var copyCommand = new CopyFolderNotesCommand(request.UserId, caller, noteCopyIds);
                var res = await mediator.Send(copyCommand);

                if (res.Data != null) {
                    copyResults = res.Data.ToDictionary(x => x.PreviousId);
                }
            }
        }

        var dbFolders = await CopyFoldersAsync(foldersForCopy, request.UserId);

        var folderNotes = dbFolders.SelectMany(folder => folder.NoteIds.Select(noteId => new FoldersNotes()
        {
            FolderId = folder.Id,
            NoteId = copyResults.ContainsKey(noteId) ? copyResults[noteId].NewId : noteId
        }));

        await foldersNotesRepository.AddRangeAsync(folderNotes);

        var folderIds = dbFolders.Select(x => x.Id).ToList();
        var resultFolders = await folderRepository.GetFoldersIncludeNote(request.UserId, folderIds);
        
        var ents = appCustomMapper.MapFoldersToSmallFolders(resultFolders, request.UserId);
        var result = new CopyFoldersResult
        {
            Folders = ents,
            NoteIds = copyResults.Select(x => x.Value.NewId).ToList()
        };
        return new OperationResult<CopyFoldersResult>(true, result);
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
                NoteIds = x.FoldersNotes.Select(x => x.NoteId).ToList()
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