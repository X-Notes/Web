using System;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Albums
{
    public class RemovePhotoFromAlbumCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [ValidationGuid]
        public Guid PhotoId { set; get; }

        public RemovePhotoFromAlbumCommand(Guid NoteId, Guid ContentId, Guid PhotoId)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.PhotoId = PhotoId;
        }
    }
}
