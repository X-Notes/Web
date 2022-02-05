using System;
using System.Collections.Generic;


namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class RemovePhotosFromCollectionCommand : BaseRemoveFromCollectionItems
    {
        public RemovePhotosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
        {
        }
    }
}
