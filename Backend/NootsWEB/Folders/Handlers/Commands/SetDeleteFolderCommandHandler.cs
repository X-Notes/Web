using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using DatabaseContext.Repositories.Folders;
using Folders.Commands;
using MediatR;
using Permissions.Impl;
using Permissions.Queries;

namespace Folders.Handlers.Commands;

public class SetDeleteFolderCommandHandler : IRequestHandler<SetDeleteFolderCommand, OperationResult<List<Guid>>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;

    public SetDeleteFolderCommandHandler(
        IMediator mediator, 
        FolderRepository folderRepository,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
    }
    
    public async Task<OperationResult<List<Guid>>> Handle(SetDeleteFolderCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var processedIds = new List<Guid>();

        var foldersOwner = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Folder).ToList();
        if (foldersOwner.Any())
        {
            foldersOwner.ForEach(x => {
                x.ToType(FolderTypeENUM.Deleted, DateTimeProvider.Time);
                x.SetDateAndVersion();
            });
            await folderRepository.UpdateRangeAsync(foldersOwner);
            processedIds = foldersOwner.Select(x => x.Id).ToList();
        }

        await usersOnPrivateFoldersService.RevokePermissionsFolders(request.UserId, request.Ids);

        return new OperationResult<List<Guid>>(true, processedIds);
    }
}