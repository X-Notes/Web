using System;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Encryption
{
    public class DecriptionNoteCommand : BaseCommandEntity, IRequest<OperationResult<bool>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public string Password { set; get; }
    }
}
