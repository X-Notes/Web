using Common.DTO.Users;
using DatabaseContext.Repositories.Notes;
using Mapper.Mapping;
using MediatR;
using Sharing.Queries;

namespace Sharing.Handlers.Queries;

public class GetUsersOnPrivateNoteQueryHandler : IRequestHandler<GetUsersOnPrivateNoteQuery, List<InvitedUsersToFoldersOrNote>>
{
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly UserBackgroundMapper userBackgroundMapper;
    
    public GetUsersOnPrivateNoteQueryHandler(UserBackgroundMapper userBackgroundMapper, UsersOnPrivateNotesRepository usersOnPrivateNotesRepository)
    {
        this.userBackgroundMapper = userBackgroundMapper;
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
    }
    
    public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateNoteQuery request, CancellationToken cancellationToken)
    {
        var users = await usersOnPrivateNotesRepository.GetByNoteIdUserOnPrivateNote(request.NoteId);
        return users.Select(x => userBackgroundMapper.MapToInvitedUsersToFoldersOrNote(x)).ToList();
    }

}