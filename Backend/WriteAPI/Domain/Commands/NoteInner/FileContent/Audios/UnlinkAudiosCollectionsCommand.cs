using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class UnlinkAudiosCollectionsCommand : BaseUnlinkCommand
    {
        public UnlinkAudiosCollectionsCommand(Guid noteId, List<Guid> contentIds, string email) : base(noteId, contentIds, email)
        {
        }
    }
}
