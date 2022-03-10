using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Common.DTO.Users;
using Domain.Queries.Sharing;
using MediatR;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;

namespace BI.Services.Sharing
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
