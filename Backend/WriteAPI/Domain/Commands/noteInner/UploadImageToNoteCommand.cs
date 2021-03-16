using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Domain.Commands.noteInner
{
    public class UploadImageToNoteCommand : BaseCommandEntity, IRequest<OperationResult<AlbumNoteDTO>>
    {
        [Required]
        public List<IFormFile> Photos { set; get; }
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
        [ValidationGuidAttribute]
        public Guid ContentId { set; get; }
        public UploadImageToNoteCommand(List<IFormFile> Photos, Guid NoteId, Guid ContentId)
        {
            this.Photos = Photos;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}
