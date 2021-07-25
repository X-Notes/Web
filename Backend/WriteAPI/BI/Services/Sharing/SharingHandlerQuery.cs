using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
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
        private readonly IMapper mapper;
        public SharingHandlerQuery(
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
            IMapper mapper)
        {
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.mapper = mapper;
        }

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateNoteQuery request, CancellationToken cancellationToken)
        {
            var users = await usersOnPrivateNotesRepository.GetByNoteIdUserOnPrivateNote(request.NoteId);
            return mapper.Map<List<InvitedUsersToFoldersOrNote>>(users);
        }

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateFolderQuery request, CancellationToken cancellationToken)
        {
            var users = await usersOnPrivateFoldersRepository.GetByFolderIdUserOnPrivateFolder(request.FolderId);
            return mapper.Map<List<InvitedUsersToFoldersOrNote>>(users);
        }
    }
}
