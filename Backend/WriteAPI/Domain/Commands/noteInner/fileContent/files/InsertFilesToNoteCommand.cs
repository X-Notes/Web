

using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.files
{
    public class InsertFilesToNoteCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [Required]
        public List<IFormFile> Files { set; get; }
        [ValidationGuid]
        public Guid NoteId { set; get; }
        [ValidationGuid]
        public Guid ContentId { set; get; }
        public InsertFilesToNoteCommand(List<IFormFile> Files, Guid NoteId, Guid ContentId)
        {
            this.Files = Files;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}
