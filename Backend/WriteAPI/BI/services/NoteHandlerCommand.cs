using Domain.Commands.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.models;
using WriteContext.Repositories;

namespace BI.services
{
    public class NoteHandlerCommand : 
        IRequestHandler<NewNoteCommand, int>
    {

        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        public NoteHandlerCommand(UserRepository userRepository, NoteRepository noteRepository)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
        }
        public async Task<int> Handle(NewNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);

            var note = new Note()
            {
                UserId = user.Id,
                Order = 1
            };

            await this.noteRepository.Add(note);
            return note.Id;
        }
    }
}
