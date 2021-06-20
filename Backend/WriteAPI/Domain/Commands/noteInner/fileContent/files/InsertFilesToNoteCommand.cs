

using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.files
{
    public class InsertFilesToNoteCommand : BaseCommandEntity, IRequest<OperationResult<DocumentNoteDTO>>
    {
        [Required]
        public IFormFile File { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public InsertFilesToNoteCommand(IFormFile File, Guid NoteId, Guid ContentId)
        {
            this.File = File;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}
