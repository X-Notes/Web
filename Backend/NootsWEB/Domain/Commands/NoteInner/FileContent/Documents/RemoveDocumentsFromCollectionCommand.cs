using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class RemoveDocumentsFromCollectionCommand : BaseRemoveFromCollectionItems
    {
        public RemoveDocumentsFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
        {
        }
    }
}
