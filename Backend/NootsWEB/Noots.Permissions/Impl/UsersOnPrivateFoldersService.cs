using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Systems;
using Noots.DatabaseContext.Repositories.Folders;

namespace Permissions.Impl;

public class UsersOnPrivateFoldersService
{
	private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
    private readonly FoldersNotesRepository foldersNotesRepository;

    public UsersOnPrivateFoldersService(
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
        FoldersNotesRepository foldersNotesRepository)
	{
		this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        this.foldersNotesRepository = foldersNotesRepository;
    }

    public async Task<IEnumerable<Guid>> RevokeAllPermissionsFolder(Guid folderId)
    {
        var usersOnPrivate = await usersOnPrivateFoldersRepository.GetWhereAsync(x => x.FolderId == folderId);

        if (!usersOnPrivate.Any())
        {
            return new List<Guid>();
        }

        var userIds = usersOnPrivate.Select(x => x.UserId);

        await RemoveUserRelatedNotesAsync(userIds, new List<Guid> { folderId });

        await usersOnPrivateFoldersRepository.RemoveRangeAsync(usersOnPrivate);

        return userIds;
    }

    public async Task<bool> RevokePermissionsFolders(Guid userId, List<Guid> folderIds)
    {
        var usersOnPrivate = await usersOnPrivateFoldersRepository.GetWhereAsync(x => userId == x.UserId && folderIds.Contains(x.FolderId));

        if (!usersOnPrivate.Any())
        {
            return false;
        }

        await RemoveUserRelatedNotesAsync(new List<Guid> { userId }, folderIds);

        await usersOnPrivateFoldersRepository.RemoveRangeAsync(usersOnPrivate);

        return true;
    }

    public async Task AddPermissionsAsync(Guid folderId, RefTypeENUM refType, List<Guid> userIds)
    {
        var permissionsRequests = userIds.Select(userId => new UsersOnPrivateFolders()
        {
            AccessTypeId = refType,
            FolderId = folderId,
            UserId = userId
        }).ToList();

        await usersOnPrivateFoldersRepository.AddRangeAsync(permissionsRequests);
    }

    public async Task AddPermissionAsync(Guid folderId, RefTypeENUM refType, Guid userId)
    {
        await usersOnPrivateFoldersRepository.AddAsync(new UsersOnPrivateFolders { FolderId = folderId, AccessTypeId = refType, UserId = userId });
    }

    private async Task RemoveUserRelatedNotesAsync(IEnumerable<Guid> userIds, IEnumerable<Guid> folderIds)
    {
        var foldersNotes = await foldersNotesRepository.GetFoldersNotesByFolderIdIncludeNote(folderIds);
        var foldersNotesToDelete = foldersNotes.Where(x => userIds.Contains(x.Note.UserId));
        if (foldersNotesToDelete.Any())
        {
            await foldersNotesRepository.RemoveRangeAsync(foldersNotesToDelete);
        }
    }
}
