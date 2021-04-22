using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.albums
{
    public class ChangeAlbumSizeCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public Guid ContentId { set; get; }
        [Required(AllowEmptyStrings = false)]
        public string Width { set; get; }
        [Required(AllowEmptyStrings = false)]
        public string Height { set; get; }
    }
}
