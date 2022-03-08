using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UnlinkFilesAndRemoveDocumentsCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemoveDocumentsCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId) : base(noteId, contentIds, userId)
        {
        }

        public UnlinkFilesAndRemoveDocumentsCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId, bool isCheckPemissions) : base(noteId, contentIds, userId)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
