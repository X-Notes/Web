using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;

namespace Domain.Commands.noteInner.fileContent.albums
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
