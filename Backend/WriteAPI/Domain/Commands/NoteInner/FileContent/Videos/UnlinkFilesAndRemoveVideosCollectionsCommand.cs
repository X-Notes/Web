using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class UnlinkFilesAndRemoveVideosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemoveVideosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }

        public UnlinkFilesAndRemoveVideosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email, bool isCheckPemissions) : base(noteId, contentIds, email)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
