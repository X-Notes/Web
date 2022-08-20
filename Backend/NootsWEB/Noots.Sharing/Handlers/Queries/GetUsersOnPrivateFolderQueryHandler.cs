using Common.DTO.Users;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Sharing.Queries;
using WriteContext.Repositories.Folders;

namespace Noots.Sharing.Handlers.Queries;

public class GetUsersOnPrivateFolderQueryHandler : IRequestHandler<GetUsersOnPrivateFolderQuery, List<InvitedUsersToFoldersOrNote>>
{
    private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
    private readonly UserBackgroundMapper userBackgroundMapper;
    
    public GetUsersOnPrivateFolderQueryHandler(UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository, UserBackgroundMapper userBackgroundMapper)
    {
        this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        this.userBackgroundMapper = userBackgroundMapper;
    }
    
    public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateFolderQuery request, CancellationToken cancellationToken)
    {
        var users = await usersOnPrivateFoldersRepository.GetByFolderIdUserOnPrivateFolder(request.FolderId);
        return users.Select(x => userBackgroundMapper.MapToInvitedUsersToFoldersOrNote(x)).ToList();
    }
}