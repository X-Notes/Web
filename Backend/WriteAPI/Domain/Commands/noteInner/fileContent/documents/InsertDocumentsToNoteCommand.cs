

using Common.Attributes;
using Common.DTO.notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.noteInner.fileContent.documents
{
    public class InsertDocumentsToNoteCommand : BaseCommandEntity, IRequest<OperationResult<DocumentNoteDTO>>
    {
        [Required]
        public IFormFile File { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public InsertDocumentsToNoteCommand(IFormFile File, Guid NoteId, Guid ContentId)
        {
            this.File = File;
            this.NoteId = NoteId;
            this.ContentId = ContentId;
        }
    }
}
