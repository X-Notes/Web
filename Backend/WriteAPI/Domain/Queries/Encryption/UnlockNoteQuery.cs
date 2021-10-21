using System;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Queries.Encryption
{
    public class UnlockNoteQuery : BaseQueryEntity, IRequest<OperationResult<bool>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public string Password { set; get; }
    }
}
