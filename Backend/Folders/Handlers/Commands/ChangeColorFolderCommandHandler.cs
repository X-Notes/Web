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

        if (!isCanEdit)
        {
            return new OperationResult<Unit>().SetNoPermissions();
        }
        
        var folderIdsForUpdate = permissions.Select(x => x.folderId);
        var foldersForUpdate = await folderRepository.GetFoldersWithPermissions(folderIdsForUpdate);
        
        foreach (var folder in foldersForUpdate)
        {
            folder.Color = request.Color;
            folder.SetDateAndVersion();
        }

        await folderRepository.UpdateRangeAsync(foldersForUpdate);

        // WS UPDATES
        var updates = foldersForUpdate.Select(x =>
        {
            var wsUpdate = new UpdateFolderWS { Color = x.Color, FolderId = x.Id };
            var userIds = x.UsersOnPrivateFolders.Select(q => q.UserId).ToList();
            userIds.Add(x.UserId);
            return (wsUpdate, userIds);
        });
        await folderWsUpdateService.UpdateFolders(updates, request.ConnectionId);

        return new OperationResult<Unit>(true, Unit.Value);
    }
}