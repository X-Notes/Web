using Common.DTO.Folders.AdditionalContent;
using DatabaseContext.Repositories.Folders;
using Folders.Queries;
using MediatR;

namespace Folders.Handlers.Queries;

public class GetAdditionalContentFolderInfoQueryHandler : IRequestHandler<GetAdditionalContentFolderInfoQuery, List<BottomFolderContent>>
{
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

    public GetAdditionalContentFolderInfoQueryHandler(UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
    {
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
    }
    
    public async Task<List<BottomFolderContent>> Handle(GetAdditionalContentFolderInfoQuery request, CancellationToken cancellationToken)
    {
        var usersOnFolder = await usersOnPrivateFoldersRepository.GetByFolderIds(request.FolderIds);
        var usersOnNotesDict = usersOnFolder.ToLookup(x => x.FolderId);
        return request.FolderIds.Select(folderId => new BottomFolderContent
        {
            IsHasUserOnNote = usersOnNotesDict.Contains(folderId),
            FolderId = folderId
        }).ToList();
    }
}