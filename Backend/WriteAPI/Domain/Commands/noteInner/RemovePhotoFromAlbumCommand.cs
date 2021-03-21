using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.noteInner
{
    public class RemovePhotoFromAlbumCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
        [ValidationGuidAttribute]
        public Guid PhotoId { set; get; }
        public RemovePhotoFromAlbumCommand(Guid NoteId, Guid ContentId, Guid PhotoId)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.PhotoId = PhotoId;
        }
    }
}
