using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.noteInner
{
    public class ChangeAlbumRowCountCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
        [Range(1, 4)]
        public int Count { set; get; }
    }
}
