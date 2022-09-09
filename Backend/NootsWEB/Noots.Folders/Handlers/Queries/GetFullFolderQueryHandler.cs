using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Queries;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;

namespace Noots.Folders.Handlers.Queries;

public class GetFullFolderQueryHandler : IRequestHandler<GetFullFolderQuery, OperationResult<FullFolder>>
{
    private readonly IMediator mediator;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public GetFullFolderQueryHandler(
        IMediator mediator, 
        NoteFolderLabelMapper appCustomMapper, 
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        this.mediator = mediator;
        this.appCustomMapper = appCustomMapper;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
    }
    
    public async Task<OperationResult<FullFolder>> Handle(GetFullFolderQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForFolderQuery(request.Id, request.UserId);
        var permissions = await mediator.Send(command);
        var folder = permissions.Folder;

        if (permissions.CanWrite || permissions.CanRead)
        {
            if (permissions.Caller != null && !permissions.IsOwner && !permissions.GetAllUsers().Contains(permissions.Caller.Id))
            {
                await usersOnPrivateFoldersRepository.AddAsync(new UsersOnPrivateFolders { FolderId = folder.Id, AccessTypeId = folder.RefTypeId, UserId = permissions.Caller.Id });
            }

            var ent = appCustomMapper.MapFolderToFullFolder(folder, permissions.CanWrite);
            return new OperationResult<FullFolder>(true, ent);
        }

        return new OperationResult<FullFolder>().SetNotFound();

    }
}