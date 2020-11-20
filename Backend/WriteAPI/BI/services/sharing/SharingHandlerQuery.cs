using AutoMapper;
using Common.DTO.users;
using Domain.Queries.sharing;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.sharing
{
    public class SharingHandlerQuery:
        IRequestHandler<GetUsersOnPrivateNote, List<InvitedUsersToNote>>
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

        public async Task<List<InvitedUsersToNote>> Handle(GetUsersOnPrivateNote request, CancellationToken cancellationToken)
        {
            var users = await this.usersOnPrivateNotesRepository.GetByNoteIdUserOnPrivateNote(request.NoteId);
            return this.mapper.Map<List<InvitedUsersToNote>>(users);
        }
    }
}
