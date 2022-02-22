using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class UnlinkVideosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkVideosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }
    }
}
