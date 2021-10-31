using Common.Attributes;
using Common.DTO;
using MediatR;
using System;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class RemoveDocumentFromCollectionCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [ValidationGuid]
        public Guid ContentId { set; get; }

        [ValidationGuid]
        public Guid DocumentId { set; get; } // TODO DO MANY and for other files

        public RemoveDocumentFromCollectionCommand(Guid noteId, Guid contentId, Guid documentId)
        {
            NoteId = noteId;
            ContentId = contentId;
            DocumentId = documentId;
        }
    }
}
