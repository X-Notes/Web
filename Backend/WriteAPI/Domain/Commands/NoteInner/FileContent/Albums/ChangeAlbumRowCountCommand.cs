using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;

namespace Domain.Commands.NoteInner.FileContent.Albums
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
