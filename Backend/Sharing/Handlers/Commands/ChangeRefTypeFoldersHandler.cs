using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using DatabaseContext.Repositories.Folders;
using MediatR;
using Permissions.Queries;
using Sharing.Commands.Folders;

namespace Sharing.Handlers.Commands;

public class ChangeRefTypeFoldersHandler : IRequestHandler<ChangeRefTypeFolders, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    
    public ChangeRefTypeFoldersHandler(IMediator _mediator, FolderRepository folderRepository)
    {
        mediator = _mediator;
        this.folderRepository = folderRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(ChangeRefTypeFolders request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);
        var isCanEdit = permissions.All(x => x.perm.IsOwner);

        if (!permissions.Any())
        {
            return new OperationResult<Unit>().SetNotFound();
        }
        
        if (!isCanEdit)
        {
            return new OperationResult<Unit>().SetNoPermissions();
        }

        var folderIds = permissions.Where(x => x.perm.IsOwner).Select(x => x.folderId);
        var folders = await folderRepository.GetWhereAsync(x => folderIds.Contains(x.Id));
        
        folders.ForEach(folder =>
        {
            folder.RefTypeId = request.RefTypeId;
            folder.ToType(FolderTypeENUM.Shared);
        });

        if (folders.Any())
        {
            await folderRepository.UpdateRangeAsync(folders);
        }
        
        return new OperationResult<Unit>(true, Unit.Value);
    }
}