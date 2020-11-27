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
    public class FullNoteHandlerCommand :
        IRequestHandler<UpdateTitleNoteCommand, Unit>
    {
        private readonly UserRepository userRepository;
        private readonly NoteRepository noteRepository;
        public FullNoteHandlerCommand(UserRepository userRepository, NoteRepository noteRepository)
        {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
        }

        public async Task<Unit> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null && Guid.TryParse(request.Id, out var guid))
            {
                var note = await this.noteRepository.GetForUpdatingTitle(guid);
                switch (note.NoteType)
                {
                    case NotesType.Shared:
                        {
                            switch (note.RefType)
                            {
                                case RefType.Editor:
                                    {
                                        throw new Exception("No implimented");
                                        break;
                                    }
                                case RefType.Viewer:
                                    {
                                        throw new Exception("No implimented");
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            if (note.UserId == user.Id)
                            {
                                note.Title = request.Title;
                                await noteRepository.UpdateNote(note);
                            }
                            else
                            {
                                var noteUser = note.UsersOnPrivateNotes.FirstOrDefault(x => x.UserId == user.Id);
                                if (noteUser != null && noteUser.AccessType == RefType.Editor)
                                {
                                    note.Title = request.Title;
                                    await noteRepository.UpdateNote(note);
                                }
                                else
                                {
                                    throw new Exception("No access rights");
                                }
                            }
                            break;
                        }
                }
            }
            return Unit.Value;
        }
    }
}
