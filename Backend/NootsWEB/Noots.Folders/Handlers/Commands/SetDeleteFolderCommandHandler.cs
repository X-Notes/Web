using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Commands;
using Noots.Permissions.Queries;

namespace Noots.Folders.Handlers.Commands;

public class SetDeleteFolderCommandHandler : IRequestHandler<SetDeleteFolderCommand, OperationResult<List<Guid>>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public SetDeleteFolderCommandHandler(
        IMediator mediator, 
        FolderRepository folderRepository,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
    }
    
    public async Task<OperationResult<List<Guid>>> Handle(SetDeleteFolderCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var processedIds = new List<Guid>();

        var foldersOwner = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Folder).ToList();
        if (foldersOwner.Any())
        {
            foldersOwner.ForEach(x => x.ToType(FolderTypeENUM.Deleted, DateTimeProvider.Time));
            await folderRepository.UpdateRangeAsync(foldersOwner);
            processedIds = foldersOwner.Select(x => x.Id).ToList();
        }

        var usersOnPrivate = await usersOnPrivateFoldersRepository.GetWhereAsync(x => request.UserId == x.UserId && request.Ids.Contains(x.FolderId));
        if (usersOnPrivate.Any())
        {
            await usersOnPrivateFoldersRepository.RemoveRangeAsync(usersOnPrivate);
        }

        return new OperationResult<List<Guid>>(true, processedIds);
    }
}