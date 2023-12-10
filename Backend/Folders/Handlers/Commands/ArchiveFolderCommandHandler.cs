using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using DatabaseContext.Repositories.Folders;
using Folders.Commands;
using MediatR;
using Permissions.Queries;

namespace Folders.Handlers.Commands;

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

        var folderIds = permissions.Where(x => x.perm.IsOwner).Select(x => x.folderId).ToList();
        if (folderIds.Any())
        {
            var folders = await folderRepository.GetWhereAsync(x => folderIds.Contains(x.Id));
            
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