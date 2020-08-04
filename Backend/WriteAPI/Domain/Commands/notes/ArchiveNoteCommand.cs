using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.notes
{
    public class ArchiveNoteCommand : BaseCommandEntity, IRequest<Unit> 
    {
        public List<string> Ids { set; get; }
        public NotesType NoteType { set; get; }
        public ArchiveNoteCommand(string email) : base(email)
        {

        }
    }
}
