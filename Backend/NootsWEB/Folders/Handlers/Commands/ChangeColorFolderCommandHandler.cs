using Common.DTO;
using Common.DTO.WebSockets;
using DatabaseContext.Repositories.Folders;
using Folders.Commands;
using MediatR;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Folders.Handlers.Commands;

public class ChangeColorFolderCommandHandler : IRequestHandler<ChangeColorFolderCommand, OperationResult<Unit>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    private readonly FolderWSUpdateService folderWsUpdateService;

    public ChangeColorFolderCommandHandler(
        IMediator mediator, 
        FolderRepository folderRepository,
        FolderWSUpdateService folderWSUpdateService)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
        folderWsUpdateService = folderWSUpdateService;
    }
    
    public async Task<OperationResult<Unit>> Handle(ChangeColorFolderCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);
        var isCanEdit = permissions.All(x => x.perm.CanWrite);
        if (isCanEdit)
        {
            var foldersForUpdate = permissions.Select(x => x.perm.Folder);
            foreach (var folder in foldersForUpdate)
            {
                folder.Color = request.Color;
                folder.SetDateAndVersion();
            }

            await folderRepository.UpdateRangeAsync(foldersForUpdate);

            // WS UPDATES
            var updates = permissions.Select(x => (new UpdateFolderWS { Color = request.Color, FolderId = x.folderId }, x.perm.GetAllUsers()));
            await folderWsUpdateService.UpdateFolders(updates, request.ConnectionId);

            return new OperationResult<Unit>(true, Unit.Value);
        }
        return new OperationResult<Unit>().SetNoPermissions();
    }
}