using System;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class UnlinkPhotosCollectionCommand : BaseUnlinkCommand
    {
        public UnlinkPhotosCollectionCommand(Guid noteId, Guid contentId, string email) : base(noteId, contentId, email)
        {
        }
    }
}
