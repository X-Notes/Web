using System;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UpdateDocumentsCollectionInfoCommand : BaseUpdateCollectionInfo
    {
        public UpdateDocumentsCollectionInfoCommand(Guid noteId, Guid contentId, string name) : base(noteId, contentId, name)
        {
        }
    }
}
