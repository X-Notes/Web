using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Notes
{
    public class ArchiveNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>> 
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }
        

        public ArchiveNoteCommand(Guid userId) : base(userId)
        {

        }
    }
}
