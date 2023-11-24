using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Commands;
using Permissions.Queries;

namespace Noots.Folders.Handlers.Commands;

public class ArchiveFolderCommandHandler : IRequestHandler<ArchiveFolderCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;

    public ArchiveFolderCommandHandler(IMediator mediator, FolderRepository folderRepository)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(ArchiveFolderCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        var folders = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Folder).ToList();
        if (folders.Any())
        {
            folders.ForEach(x =>
            {
                x.ToType(FolderTypeENUM.Archived);
                x.SetDateAndVersion();
            });
            await folderRepository.UpdateRangeAsync(folders);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNotFound();
    }
}