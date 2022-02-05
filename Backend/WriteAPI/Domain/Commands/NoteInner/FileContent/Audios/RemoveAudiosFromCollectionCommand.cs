using System;
using System.Collections.Generic;


namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class RemoveAudiosFromCollectionCommand : BaseRemoveFromCollectionItems
    {
        public RemoveAudiosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
        {
        }
    }
}
