using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using Folders.Queries;
using Mapper.Mapping;
using MediatR;
using Permissions.Impl;
using Permissions.Queries;

namespace Folders.Handlers.Queries;

public class GetFullFolderQueryHandler : IRequestHandler<GetFullFolderQuery, OperationResult<FullFolder>>
{
    private readonly IMediator mediator;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;

    public GetFullFolderQueryHandler(
        IMediator mediator, 
        NoteFolderLabelMapper appCustomMapper,
        UsersOnPrivateFoldersService usersOnPrivateFoldersService)
    {
        this.mediator = mediator;
        this.appCustomMapper = appCustomMapper;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
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
                await usersOnPrivateFoldersService.AddPermissionAsync(folder.Id, folder.RefTypeId, permissions.Caller.Id);
            }

            if (!permissions.IsOwner)
            {
                folder.FolderTypeId = FolderTypeENUM.Shared;
            }

            var ent = appCustomMapper.MapFolderToFullFolder(folder, permissions.CanWrite);
            return new OperationResult<FullFolder>(true, ent);
        }

        return new OperationResult<FullFolder>().SetNotFound();

    }
}