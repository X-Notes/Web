using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.albums
{
    public class ChangeAlbumRowCountCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [Range(1, 4)]
        public int Count { set; get; }
    }
}
