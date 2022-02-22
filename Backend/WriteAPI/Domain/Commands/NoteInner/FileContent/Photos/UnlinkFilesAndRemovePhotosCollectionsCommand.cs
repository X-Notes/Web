using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class UnlinkFilesAndRemovePhotosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemovePhotosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }

        public UnlinkFilesAndRemovePhotosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email, bool isCheckPemissions) : base(noteId, contentIds, email)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
