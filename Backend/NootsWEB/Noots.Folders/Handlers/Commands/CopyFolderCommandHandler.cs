using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Commands;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;

namespace Noots.Folders.Handlers.Commands;

public class CopyFolderCommandHandler : IRequestHandler<CopyFolderCommand, OperationResult<List<SmallFolder>>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly BillingPermissionService billingPermissionService;

    public CopyFolderCommandHandler(
        IMediator mediator, 
        FolderRepository folderRepository,
        FoldersNotesRepository foldersNotesRepository,
        NoteFolderLabelMapper appCustomMapper,
        BillingPermissionService billingPermissionService)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
        this.foldersNotesRepository = foldersNotesRepository;
        this.appCustomMapper = appCustomMapper;
        this.billingPermissionService = billingPermissionService;
    }
    
    public async Task<OperationResult<List<SmallFolder>>> Handle(CopyFolderCommand request, CancellationToken cancellationToken)
    {
        var resultIds = new List<Guid>();
        var order = -1;

        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var idsForCopy = permissions.Where(x => x.perm.CanRead).Select(x => x.folderId).ToList();
        
        if (!idsForCopy.Any())
        {
            return new OperationResult<List<SmallFolder>>().SetNotFound();
        }

        var availableFolders = await billingPermissionService.GetAvailableCountFolders(request.UserId);
        if (idsForCopy.Count > availableFolders)
        {
            return new OperationResult<List<SmallFolder>>().SetBillingError();
        }
        
        var foldersForCopy = await folderRepository.GetFoldersByIdsForCopy(idsForCopy);
        foreach(var folderForCopy in foldersForCopy)
        {
            var newFolder = new Folder()
            {
                Title = folderForCopy.Title,
                Color = folderForCopy.Color,
                FolderTypeId = FolderTypeENUM.Private,
                RefTypeId = folderForCopy.RefTypeId,
                Order = order--,
                CreatedAt = DateTimeProvider.Time,
                UpdatedAt = DateTimeProvider.Time,
                UserId = request.UserId
            };
            var dbFolder = await folderRepository.AddAsync(newFolder);
            resultIds.Add(dbFolder.Entity.Id);
            var foldersNotes = folderForCopy.FoldersNotes.Select(note => new FoldersNotes()
            {
                FolderId = dbFolder.Entity.Id,
                NoteId = note.NoteId
            });
            await foldersNotesRepository.AddRangeAsync(foldersNotes);
        }

        var dbFolders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesIncludeNote(request.UserId, FolderTypeENUM.Private);
        var orders = Enumerable.Range(1, dbFolders.Count);
        dbFolders = dbFolders.Zip(orders, (folder, order) => {
            folder.Order = order;
            return folder;
        }).ToList();

        await folderRepository.UpdateRangeAsync(dbFolders);
        var resultFolders = dbFolders.Where(dbFolder => resultIds.Contains(dbFolder.Id)).ToList();
        
        var ents =  appCustomMapper.MapFoldersToSmallFolders(resultFolders, request.UserId);
        return new OperationResult<List<SmallFolder>>(true, ents);
    }
}