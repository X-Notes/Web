using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class UnlinkPhotosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkPhotosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }
    }
}
