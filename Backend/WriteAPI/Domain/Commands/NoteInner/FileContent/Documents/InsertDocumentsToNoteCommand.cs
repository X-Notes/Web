using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.NoteInner.FileContent.Documents
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
