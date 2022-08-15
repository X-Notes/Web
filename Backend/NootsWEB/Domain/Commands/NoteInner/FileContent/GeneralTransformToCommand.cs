using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;
using System;

namespace Domain.Commands.NoteInner.FileContent
{
    public class GeneralTransformToCommand<T> : BaseCommandEntity, IRequest<OperationResult<T>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public GeneralTransformToCommand(Guid noteId, Guid contentId)
        {
            this.NoteId = noteId;
            this.ContentId = contentId;
        }
    }
}
