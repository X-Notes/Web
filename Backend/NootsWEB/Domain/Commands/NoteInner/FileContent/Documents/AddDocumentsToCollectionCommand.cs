using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class AddDocumentsToCollectionCommand : BaseAddToCollectionItems
    {
        public AddDocumentsToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds) : base(noteId, contentId, fileIds)
        {
        }
    }
}
