using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class UnlinkFilesAndRemovePhotosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemovePhotosCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId) : base(noteId, contentIds, userId)
        {
        }

        public UnlinkFilesAndRemovePhotosCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId, bool isCheckPemissions) : base(noteId, contentIds, userId)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
