using System;
using System.Collections.Generic;


namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class AddVideosToCollectionCommand : BaseAddToCollectionItems
    {
        public AddVideosToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds) : base(noteId, contentId, fileIds)
        {
        }
    }
}
