using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UnlinkDocumentsCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkDocumentsCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }
    }
}
