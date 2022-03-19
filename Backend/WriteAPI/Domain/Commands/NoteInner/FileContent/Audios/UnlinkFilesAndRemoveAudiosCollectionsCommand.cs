using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class UnlinkFilesAndRemoveAudiosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemoveAudiosCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId) : base(noteId, contentIds, userId)
        {
        }

        public UnlinkFilesAndRemoveAudiosCollectionsCommand(Guid noteId, List<Guid> contentIds, Guid userId, bool isCheckPemissions) : base(noteId, contentIds, userId)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
