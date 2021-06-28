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
        IRequestHandler<GetUsersOnPrivateNote, List<InvitedUsersToFoldersOrNote>>,
        IRequestHandler<GetUsersOnPrivateFolder, List<InvitedUsersToFoldersOrNote>>
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

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateNote request, CancellationToken cancellationToken)
        {
            var users = await usersOnPrivateNotesRepository.GetByNoteIdUserOnPrivateNote(request.NoteId);
            return mapper.Map<List<InvitedUsersToFoldersOrNote>>(users);
        }

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateFolder request, CancellationToken cancellationToken)
        {
            var users = await usersOnPrivateFoldersRepository.GetByFolderIdUserOnPrivateFolder(request.FolderId);
            return mapper.Map<List<InvitedUsersToFoldersOrNote>>(users);
        }
    }
}
