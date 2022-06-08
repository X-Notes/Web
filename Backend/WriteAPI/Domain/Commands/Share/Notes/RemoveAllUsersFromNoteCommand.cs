using Common.Attributes;
using Common.DTO;
using MediatR;
using System;

namespace Domain.Commands.Share.Notes
{
    public class RemoveAllUsersFromNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
    }
}
