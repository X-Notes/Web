using Common.DatabaseModels.helpers;
using Domain.Commands.noteInner;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.notes
{
    public class FullNoteHandlerCommand:
        IRequestHandler<UpdateTitleCommand, Unit>
    {
        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        public FullNoteHandlerCommand(UserRepository userRepository, NoteRepository noteRepository)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
        }

        public async Task<Unit> Handle(UpdateTitleCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithNotes(request.Email);
            var note = user.Notes.FirstOrDefault(x => x.Id.ToString("N") == request.Id);

            if (note != null)
            {
                note.Title = request.Title;
                await noteRepository.UpdateNote(note);
                if(note.NoteType == NotesType.Shared)
                {
                    Console.WriteLine("TODO UPDATE SHARED FOR ALL USER");
                }
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }
    }
}
