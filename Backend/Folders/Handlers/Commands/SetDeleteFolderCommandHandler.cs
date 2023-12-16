using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using DatabaseContext.Repositories.Folders;
using Folders.Commands;
using MediatR;
using Permissions.Queries;
using Permissions.Services;

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

        var folderIds = permissions.Where(x => x.perm.IsOwner).Select(x => x.folderId).ToList();
        if (folderIds.Any())
        {
            var folders = await folderRepository.GetWhereAsync(x => folderIds.Contains(x.Id));
            folders.ForEach(x => {
                x.ToType(FolderTypeENUM.Deleted, DateTimeProvider.Time);
                x.SetDateAndVersion();
            });
            await folderRepository.UpdateRangeAsync(folders);
            processedIds = folders.Select(x => x.Id).ToList();
        }

        await usersOnPrivateFoldersService.RevokePermissionsFolders(request.UserId, request.Ids);

        return new OperationResult<List<Guid>>(true, processedIds);
    }
}