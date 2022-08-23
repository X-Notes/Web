using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Queries;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;

namespace Noots.Folders.Handlers.Queries;

public class GetFoldersByFolderIdsQueryHandler : IRequestHandler<GetFoldersByFolderIdsQuery, OperationResult<List<SmallFolder>>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;

    public GetFoldersByFolderIdsQueryHandler(IMediator mediator, FolderRepository folderRepository, NoteFolderLabelMapper appCustomMapper)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
        this.appCustomMapper = appCustomMapper;
    }
    
    public async Task<OperationResult<List<SmallFolder>>> Handle(GetFoldersByFolderIdsQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFoldersManyQuery(request.FolderIds, request.UserId);
        var permissions = await mediator.Send(command);

        var canReadIds = permissions.Where(x => x.perm.CanRead).Select(x => x.folderId);
        if (canReadIds.Any())
        {
            var folders = await folderRepository.GetFoldersByFolderIdsIncludeNote(canReadIds, request.Settings);
            folders.ForEach(folder =>
            {
                if (folder.UserId != request.UserId)
                {
                    folder.FolderTypeId = FolderTypeENUM.Shared;
                }
            });
            var result = appCustomMapper.MapFoldersToSmallFolders(folders, request.UserId);
            return new OperationResult<List<SmallFolder>>(true, result);
        }
        return new OperationResult<List<SmallFolder>>().SetNotFound();
    }
}