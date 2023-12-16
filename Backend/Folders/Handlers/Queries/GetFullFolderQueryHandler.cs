using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using DatabaseContext.Repositories.Folders;
using Folders.Queries;
using Mapper.Mapping;
using MediatR;
using Permissions.Queries;
using Permissions.Services;

namespace Folders.Handlers.Queries;

public class GetFullFolderQueryHandler : IRequestHandler<GetFullFolderQuery, OperationResult<FullFolder>>
{
    private readonly IMediator mediator;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;
    private readonly FolderRepository folderRepository;

    public GetFullFolderQueryHandler(
        IMediator mediator, 
        NoteFolderLabelMapper appCustomMapper,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService,
        FolderRepository folderRepository)
    {
        this.mediator = mediator;
        this.appCustomMapper = appCustomMapper;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
        this.folderRepository = folderRepository;
    }
    
    public async Task<OperationResult<FullFolder>> Handle(GetFullFolderQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.Id, request.UserId);
        var permissions = await mediator.Send(command);

        if (!permissions.CanRead)
        {
            return new OperationResult<FullFolder>().SetNoPermissions();
        }

        var folder = await folderRepository.GetFolderWithPermissions(request.Id);
        
        var userIds = folder.UsersOnPrivateFolders.Select(x => x.UserId).ToList();
        userIds.Add(folder.UserId);
        
        if (permissions.CallerId != Guid.Empty && !permissions.IsOwner && !userIds.Contains(permissions.CallerId))
        {
            await usersOnPrivateFoldersService.AddPermissionAsync(folder.Id, folder.RefTypeId, permissions.CallerId);
        }

        // TODO Crunch
        if (!permissions.IsOwner)
        {
            folder.FolderTypeId = FolderTypeENUM.Shared;
        }

        var ent = appCustomMapper.MapFolderToFullFolder(folder, permissions.CanWrite);
        return new OperationResult<FullFolder>(true, ent);
    }
}