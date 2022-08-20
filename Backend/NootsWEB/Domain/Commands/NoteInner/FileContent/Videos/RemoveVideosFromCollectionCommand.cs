using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class RemoveVideosFromCollectionCommand : BaseRemoveFromCollectionItems
    {
        public RemoveVideosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
        {
        }
    }
}
