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

        if (isCanEdit)
        {
            foreach (var perm in permissions)
            {
                var folder = perm.perm.Folder;
                folder.RefTypeId = request.RefTypeId;
                folder.ToType(FolderTypeENUM.Shared);
                await folderRepository.UpdateAsync(folder);
            }
            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}