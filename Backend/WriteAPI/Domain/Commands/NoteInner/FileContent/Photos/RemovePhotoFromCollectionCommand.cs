using System;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class RemovePhotoFromCollectionCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [ValidationGuid]
        public Guid PhotoId { set; get; }

        public RemovePhotoFromCollectionCommand(Guid NoteId, Guid ContentId, Guid PhotoId)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.PhotoId = PhotoId;
        }
    }
}
