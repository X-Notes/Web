using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Folders;
using MediatR;
using Noots.Billing.Impl;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Commands;
using Noots.Mapper.Mapping;

namespace Noots.Folders.Handlers.Commands;

public class NewFolderCommandHandler : IRequestHandler<NewFolderCommand, OperationResult<SmallFolder>>
{
    private readonly FolderRepository folderRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly BillingPermissionService billingPermissionService;

    public NewFolderCommandHandler(
        FolderRepository folderRepository, 
        NoteFolderLabelMapper appCustomMapper,
        BillingPermissionService billingPermissionService)
    {
        this.folderRepository = folderRepository;
        this.appCustomMapper = appCustomMapper;
        this.billingPermissionService = billingPermissionService;
    }
    
    public async Task<OperationResult<SmallFolder>> Handle(NewFolderCommand request, CancellationToken cancellationToken)
    {
        var isCanCreate = await billingPermissionService.CanCreateFolderAsync(request.UserId);
        if (!isCanCreate)
        {
            return new OperationResult<SmallFolder>().SetBillingError();
        }
        
        var folder = new Folder()
        {
            UserId = request.UserId,
            Order = 1,
            Color = FolderColorPallete.Green,
            FolderTypeId = FolderTypeENUM.Private,
            RefTypeId = RefTypeENUM.Viewer,
            CreatedAt = DateTimeProvider.Time
        };
        folder.SetDateAndVersion();

        await folderRepository.AddAsync(folder);
        var ent = appCustomMapper.MapFolderToSmallFolder(folder, true);
        return new OperationResult<SmallFolder>(true, ent);
    }
}