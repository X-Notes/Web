using Common.DTO.Notes.FullNoteContent;
using System;


namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateDocumentsCollectionWS : BaseUpdateFileContentWS<DocumentsCollectionNoteDTO>
    {
        public UpdateDocumentsCollectionWS(Guid contentId, UpdateOperationEnum operation, DateTimeOffset time) : base(contentId, operation, time)
        {
        }
    }
}
