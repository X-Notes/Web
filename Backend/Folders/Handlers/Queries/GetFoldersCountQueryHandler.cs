using Common.DatabaseModels.Models.Folders;
using Common.DTO.Folders;
using DatabaseContext.Repositories.Folders;
using Folders.Queries;
using MediatR;
using Permissions.Services;

namespace Folders.Handlers.Queries;

public class GetFoldersCountQueryHandler : IRequestHandler<GetFoldersCountQuery, List<FoldersCount>>
{
    private readonly FolderRepository folderRepository;
    private readonly UsersOnPrivateFoldersService usersOnPrivateFoldersService;

    public GetFoldersCountQueryHandler(
        FolderRepository folderRepository, 
        UsersOnPrivateFoldersService usersOnPrivateFoldersService)
    {
        this.folderRepository = folderRepository;
        this.usersOnPrivateFoldersService = usersOnPrivateFoldersService;
    }
    
    public async Task<List<FoldersCount>> Handle(GetFoldersCountQuery request, CancellationToken cancellationToken)
    {
        var counts = await folderRepository.GetFoldersCountAsync(request.UserId);
        
        var sharedCount = counts.FirstOrDefault(x => x.FolderTypeId == FolderTypeENUM.Shared);
        var notesIds = await usersOnPrivateFoldersService.GetFolderIdsAsync(request.UserId);
        if (sharedCount != null)
        {
            sharedCount.Count += notesIds.Count;
        }
        else
        {
            counts.Add(new FoldersCount() { FolderTypeId = FolderTypeENUM.Shared, Count = notesIds.Count });
        }

        return counts;
    }
}