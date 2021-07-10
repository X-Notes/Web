using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Albums
{
    public class InsertAlbumToNoteCommand : BaseCommandEntity, IRequest<OperationResult<AlbumNoteDTO>>
    {
        [Required]
        public List<IFormFile> Photos { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public InsertAlbumToNoteCommand(List<IFormFile> Photos, Guid NoteId, Guid ContentId)
        {
            this.Photos = Photos;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}
