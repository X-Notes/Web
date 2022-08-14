using Common.DTO.Users;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Sharing.Queries;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;

namespace Noots.Sharing.Impl
{
    public class SharingHandlerQuery :
        IRequestHandler<GetUsersOnPrivateNoteQuery, List<InvitedUsersToFoldersOrNote>>,
        IRequestHandler<GetUsersOnPrivateFolderQuery, List<InvitedUsersToFoldersOrNote>>
    {
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
        private readonly UserBackgroundMapper userBackgroundMapper;

        public SharingHandlerQuery(
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
            UserBackgroundMapper userBackgroundMapper)
        {
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
            this.userBackgroundMapper = userBackgroundMapper;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        }

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateNoteQuery request, CancellationToken cancellationToken)
        {
            var users = await usersOnPrivateNotesRepository.GetByNoteIdUserOnPrivateNote(request.NoteId);
            return users.Select(x => userBackgroundMapper.MapToInvitedUsersToFoldersOrNote(x)).ToList();
        }

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateFolderQuery request, CancellationToken cancellationToken)
        {
            var users = await usersOnPrivateFoldersRepository.GetByFolderIdUserOnPrivateFolder(request.FolderId);
            return users.Select(x => userBackgroundMapper.MapToInvitedUsersToFoldersOrNote(x)).ToList();
        }
    }
}
