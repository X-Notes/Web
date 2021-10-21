using System;
using System.Collections.Generic;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Notes
{
    public class ArchiveNoteCommand : BaseCommandEntity, IRequest<Unit> 
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }
        

        public ArchiveNoteCommand(string email) : base(email)
        {

        }
    }
}
