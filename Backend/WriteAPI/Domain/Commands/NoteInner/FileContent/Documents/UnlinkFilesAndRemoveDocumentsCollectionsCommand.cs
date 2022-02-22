using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UnlinkFilesAndRemoveDocumentsCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemoveDocumentsCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }

        public UnlinkFilesAndRemoveDocumentsCollectionsCommand(Guid noteId, List<Guid> contentIds, string email, bool isCheckPemissions) : base(noteId, contentIds, email)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
