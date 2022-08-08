using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class AddPhotosToCollectionCommand : BaseAddToCollectionItems
    {
        public AddPhotosToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds) : base(noteId, contentId, fileIds)
        {
        }
    }
}
