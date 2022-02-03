using Common.Attributes;
using Common.DTO;
using MediatR;
using System;


namespace Domain.Commands.NoteInner.FileContent
{
    public class BaseUnlinkCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public BaseUnlinkCommand(Guid NoteId, Guid ContentId, string Email)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.Email = Email;
        }
    }
}
