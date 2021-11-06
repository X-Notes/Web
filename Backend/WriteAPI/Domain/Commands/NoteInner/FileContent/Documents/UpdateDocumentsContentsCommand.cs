using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using System;
using System.Collections.Generic;


namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UpdateDocumentsContentsCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [RequiredListNotEmptyAttribute]
        public List<DocumentsCollectionNoteDTO> Documents { set; get; } = new List<DocumentsCollectionNoteDTO>();
    }
}
