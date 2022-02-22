using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class UnlinkFilesAndRemoveAudiosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkFilesAndRemoveAudiosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }

        public UnlinkFilesAndRemoveAudiosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email, bool isCheckPemissions) : base(noteId, contentIds, email)
        {
            this.IsCheckPermissions = isCheckPemissions;
        }
    }
}
