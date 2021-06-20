using AutoMapper;
using Common.DTO.users;
using Domain.Queries.sharing;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.services.sharing
{
    public class SharingHandlerQuery:
        IRequestHandler<GetUsersOnPrivateNote, List<InvitedUsersToFoldersOrNote>>,
        IRequestHandler<GetUsersOnPrivateFolder, List<InvitedUsersToFoldersOrNote>>
    {
        private readonly FolderRepository folderRepository;
        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
        private readonly IMapper mapper;
        public SharingHandlerQuery(
            FolderRepository folderRepository,
            UserRepository userRepository,
            NoteRepository noteRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository,
            IMapper mapper)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
            this.mapper = mapper;
        }

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateNote request, CancellationToken cancellationToken)
        {
            var users = await usersOnPrivateNotesRepository.GetByNoteIdUserOnPrivateNote(request.NoteId);
            return this.mapper.Map<List<InvitedUsersToFoldersOrNote>>(users);
        }

        public async Task<List<InvitedUsersToFoldersOrNote>> Handle(GetUsersOnPrivateFolder request, CancellationToken cancellationToken)
        {
            var users = await this.usersOnPrivateFoldersRepository.GetByFolderIdUserOnPrivateFolder(request.FolderId);
            return this.mapper.Map<List<InvitedUsersToFoldersOrNote>>(users);
        }
    }
}
