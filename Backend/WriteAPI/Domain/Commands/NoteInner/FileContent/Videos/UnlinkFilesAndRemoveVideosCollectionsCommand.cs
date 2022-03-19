using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class UnlinkFilesAndRemoveVideosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemoveVideosCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId) : base(noteId, contentIds, userId)
        {
        }

        public UnlinkFilesAndRemoveVideosCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId, bool isCheckPemissions) : base(noteId, contentIds, userId)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
