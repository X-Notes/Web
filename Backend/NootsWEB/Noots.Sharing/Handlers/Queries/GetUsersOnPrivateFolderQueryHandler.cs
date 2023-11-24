using Common.DTO.Users;
using DatabaseContext.Repositories.Folders;
using Mapper.Mapping;
using MediatR;
using Sharing.Queries;

namespace Sharing.Handlers.Queries;

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