using Common.DatabaseModels.Models.Folders;
using Common.DTO.Folders;
using Mapper.Mapping;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Queries;

namespace Noots.Folders.Handlers.Queries;

public class GetFoldersByTypeQueryHandler : IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>
{
    private readonly FolderRepository folderRepository;
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;

    public GetFoldersByTypeQueryHandler(
        FolderRepository folderRepository,
        UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
        NoteFolderLabelMapper appCustomMapper)
    {
        this.folderRepository = folderRepository;
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        this.appCustomMapper = appCustomMapper;
    }
    
    public async Task<List<SmallFolder>> Handle(GetFoldersByTypeQuery request, CancellationToken cancellationToken)
    {
        var folders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesIncludeNote(request.UserId, request.TypeId, request.Settings);

        if (FolderTypeENUM.Shared == request.TypeId)
        {
            var usersOnPrivateFolders = await usersOnPrivateFoldersRepository.GetWhereAsync(x => x.UserId == request.UserId);
            var foldersIds = usersOnPrivateFolders.Select(x => x.FolderId);
            var sharedFolders = await folderRepository.GetFoldersByFolderIdsIncludeNote(foldersIds, request.Settings);
            sharedFolders.ForEach(x => x.FolderTypeId = FolderTypeENUM.Shared);
            folders.AddRange(sharedFolders);
            folders = folders.DistinctBy(x => x.Id).ToList();
        }

        return appCustomMapper.MapFoldersToSmallFolders(folders, request.UserId);
    }
}