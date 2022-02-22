using Common.Attributes;
using Common.DTO;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent
{
    public class BaseUnlinkCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public List<Guid> ContentIds { set; get; }

        public BaseUnlinkCommand(Guid noteId, List<Guid> contentIds, string email)
        {
            this.NoteId = noteId;
            this.ContentIds = contentIds;
            this.Email = email;
        }
    }
}
