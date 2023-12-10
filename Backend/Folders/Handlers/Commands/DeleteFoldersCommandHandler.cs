using Common.DTO;
using DatabaseContext.Repositories.Folders;
using Folders.Commands;
using MediatR;
using Permissions.Queries;

namespace Folders.Handlers.Commands;

public class DeleteFoldersCommandHandler : IRequestHandler<DeleteFoldersCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;

    public DeleteFoldersCommandHandler(IMediator mediator, FolderRepository folderRepository)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(DeleteFoldersCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var folderIds = permissions.Where(x => x.perm.IsOwner).Select(x => x.folderId).ToList();
        if (folderIds.Any())
        {
            var folders = await folderRepository.GetWhereAsync(x => folderIds.Contains(x.Id));
            await folderRepository.RemoveRangeAsync(folders);
            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNotFound();
    }
}