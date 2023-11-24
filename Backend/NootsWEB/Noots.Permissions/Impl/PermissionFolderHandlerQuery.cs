using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Users;
using Permissions.Entities;
using Permissions.Queries;

namespace Permissions.Impl;

public class PermissionFolderHandlerQuery :
      IRequestHandler<GetUserPermissionsForFolderQuery, UserPermissionsForFolder>,
      IRequestHandler<GetUserPermissionsForFoldersManyQuery, List<(Guid, UserPermissionsForFolder)>>
{
    private readonly UserRepository userRepository;
    private readonly FolderRepository folderRepository;

    public PermissionFolderHandlerQuery(
        UserRepository userRepository,
        FolderRepository folderRepository)
    {
        this.userRepository = userRepository;
        this.folderRepository = folderRepository;
    }

    public async Task<UserPermissionsForFolder> Handle(GetUserPermissionsForFolderQuery request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
        var folder = await folderRepository.GetForCheckPermission(request.FolderId);
        return GetFolderPermission(folder, user);
    }

    private UserPermissionsForFolder GetFolderPermission(Folder folder, User caller)
    {
        if (folder == null)
        {
            return new UserPermissionsForFolder().SetFolderNotFounded();
        }

        if (folder.UserId == caller?.Id)
        {
            return new UserPermissionsForFolder().GetFullAccess(caller, folder);
        }

        var folderUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == caller?.Id);
        if (folderUser != null && folderUser.AccessTypeId == RefTypeENUM.Editor)
        {
            return new UserPermissionsForFolder().GetFullAccess(caller, folder);
        }

        if (folder.FolderTypeId == FolderTypeENUM.Shared)
        {
            switch (folder.RefTypeId)
            {
                case RefTypeENUM.Editor:
                    {
                        if (caller == null)
                        {
                            return new UserPermissionsForFolder().GetOnlyRead(caller, folder);
                        }
                        return new UserPermissionsForFolder().GetFullAccess(caller, folder);
                    }
                case RefTypeENUM.Viewer:
                    {
                        return new UserPermissionsForFolder().GetOnlyRead(caller, folder);
                    }
            }
        }

        if (folderUser != null && folderUser.AccessTypeId == RefTypeENUM.Viewer)
        {
            return new UserPermissionsForFolder().GetOnlyRead(caller, folder);
        }

        return new UserPermissionsForFolder().NoAccessRights(caller, folder);

    }


    public async Task<List<(Guid, UserPermissionsForFolder)>> Handle(GetUserPermissionsForFoldersManyQuery request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
        if (user != null)
        {
            var folders = await folderRepository.GetForCheckPermissions(request.FolderIds);
            var foldersD = folders.ToDictionary(x => x.Id);

            var result = new List<(Guid, UserPermissionsForFolder)>();

            foreach (var id in request.FolderIds)
            {
                if (foldersD.ContainsKey(id))
                {
                    var folderD = foldersD[id];
                    result.Add((id, GetFolderPermission(folderD, user)));
                }
                else
                {
                    result.Add((id, new UserPermissionsForFolder().SetFolderNotFounded()));
                }
            }
            return result;
        }
        return new List<(Guid, UserPermissionsForFolder)>();
    }
}
