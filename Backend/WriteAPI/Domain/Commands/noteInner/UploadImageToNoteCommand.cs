using Common.Attributes;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Domain.Commands.noteInner
{
    public class UploadImageToNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<IFormFile> Photos { set; get; }
        [ValidationGuidAttribute]
        public Guid NoteId { set; get; }
    }
}
