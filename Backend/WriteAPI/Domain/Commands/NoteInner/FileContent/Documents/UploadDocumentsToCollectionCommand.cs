using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UploadDocumentsToCollectionCommand : BaseCommandEntity, IRequest<OperationResult<List<DocumentNoteDTO>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        public List<IFormFile> Documents { set; get; }

        public UploadDocumentsToCollectionCommand(Guid noteId, Guid contentId, List<IFormFile> documents)
        {
            this.NoteId = noteId;
            this.ContentId = contentId;
            this.Documents = documents;
        }
    }
}
