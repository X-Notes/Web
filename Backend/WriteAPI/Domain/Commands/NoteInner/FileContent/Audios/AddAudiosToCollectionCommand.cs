using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class AddAudiosToCollectionCommand : BaseAddToCollectionItems
    {
        public AddAudiosToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds) : base(noteId, contentId, fileIds)
        {
        }
    }
}
