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
    public class RemoveAlbumCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
        public RemoveAlbumCommand(Guid NoteId, Guid ContentId, string Email)
        {
            this.NoteId = NoteId;
            this.ContentId = ContentId;
            this.Email = Email;

        }
    }
}
