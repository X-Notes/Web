using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Systems;
using DatabaseContext.Repositories.Folders;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Permissions.Entities;
using Permissions.Queries;

namespace Permissions.QueryHandlers;

public class PermissionFolderHandlerQuery :
      IRequestHandler<GetUserPermissionsForFolderQuery, UserPermissionsForFolder>,
      IRequestHandler<GetUserPermissionsForFoldersManyQuery, List<(Guid, UserPermissionsForFolder)>>
{
    private readonly FolderRepository _folderRepository;
    private readonly UsersOnPrivateFoldersRepository _usersOnPrivateFolders;
    private readonly IMemoryCache _memoryCache;

    public PermissionFolderHandlerQuery(
        FolderRepository folderRepository,
        IMemoryCache memoryCache, 
        UsersOnPrivateFoldersRepository usersOnPrivateFolders)
    {
        _folderRepository = folderRepository;
        _memoryCache = memoryCache;
        _usersOnPrivateFolders = usersOnPrivateFolders;
    }

    public async Task<UserPermissionsForFolder> Handle(GetUserPermissionsForFolderQuery request, CancellationToken cancellationToken)
    {
        if (GetInOwnerCached(request.FolderId, request.UserId))
        {
            return new UserPermissionsForFolder().GetFullAccess(request.UserId, request.UserId, request.FolderId);
        }
        
        var folder = await _folderRepository.FirstOrDefaultNoTrackingAsync(x => x.Id == request.FolderId);
        return await GetFolderPermissionAsync(folder, request.UserId);
    }
    
    private async Task<UserPermissionsForFolder> GetFolderPermissionAsync(Folder? folder, Guid callerId)
    {
        var isAnonymous = callerId == Guid.Empty;
        
        if (folder == null)
        {
            return new UserPermissionsForFolder().SetFolderNotFounded();
        }
        
        if (folder.UserId == callerId)
        {
            SetFolderOwnerCache(folder.Id, callerId);
            return new UserPermissionsForFolder().GetFullAccess(folder.UserId, callerId, folder.Id);
        }
        
        if (folder.FolderTypeId == FolderTypeENUM.Shared)
        {
            if (folder.RefTypeId == RefTypeENUM.Viewer || isAnonymous)
            {
                return new UserPermissionsForFolder().GetOnlyRead(folder.UserId, callerId, folder.Id);
            }
            
            return new UserPermissionsForFolder().GetFullAccess(folder.UserId, callerId, folder.Id);
        }
        
        if (isAnonymous)
        {
            return new UserPermissionsForFolder().NoAccessRights(folder.UserId, callerId, folder.Id);
        }

        var folderUser = await _usersOnPrivateFolders.GetUserAsync(folder.Id, callerId);
        if (folderUser is { AccessTypeId: RefTypeENUM.Editor })
        {
            return new UserPermissionsForFolder().GetFullAccess(folder.UserId, callerId, folder.Id);
        }
        
        if (folderUser is { AccessTypeId: RefTypeENUM.Viewer })
        {
            return new UserPermissionsForFolder().GetOnlyRead(folder.UserId, callerId, folder.Id);
        }

        return new UserPermissionsForFolder().NoAccessRights(folder.UserId, callerId, folder.Id);
    }

    private bool GetInOwnerCached(Guid folderId, Guid callerId)
    {
        var key = CacheKeys.FolderOwner + folderId + "-" + callerId;
        return _memoryCache.TryGetValue(key, out bool cacheValue);
    }

    private void SetFolderOwnerCache(Guid folderId, Guid callerId)
    {
        var key = CacheKeys.FolderOwner + folderId + "-" + callerId;
        var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromHours(1));
        _memoryCache.Set(key, true, cacheEntryOptions);
    }
    
    public async Task<List<(Guid, UserPermissionsForFolder)>> Handle(GetUserPermissionsForFoldersManyQuery request, CancellationToken cancellationToken)
    {
        if (request.FolderIds == null)
        {
            return new List<(Guid, UserPermissionsForFolder)>();
        }
        
        var results = new List<(Guid, UserPermissionsForFolder)>();
        var cachedValues = new List<Guid>();
        
        foreach (var folderId in request.FolderIds)
        {
            if (GetInOwnerCached(folderId, request.UserId))
            {
                cachedValues.Add(folderId);
                var access = new UserPermissionsForFolder().GetFullAccess(request.UserId, request.UserId, folderId);
                results.Add((folderId, access));
            }
        }

        var valuesWhichNeedToProcess = request.FolderIds.Except(cachedValues).ToList();

        if (valuesWhichNeedToProcess.Count == 0)
        {
            return results;
        }
        
        var folders = await _folderRepository.GetWhereAsNoTrackingAsync(x => valuesWhichNeedToProcess.Contains(x.Id));
        var foldersD = folders.ToDictionary(x => x.Id);
        
        foreach (var id in valuesWhichNeedToProcess)
        {
            if (foldersD.TryGetValue(id, out var folderD))
            {
                var permission = await GetFolderPermissionAsync(folderD, request.UserId);
                results.Add((id, permission));
            }
            else
            {
                results.Add((id, new UserPermissionsForFolder().SetFolderNotFounded()));
            }
        }
        
        return results;
    }
}
