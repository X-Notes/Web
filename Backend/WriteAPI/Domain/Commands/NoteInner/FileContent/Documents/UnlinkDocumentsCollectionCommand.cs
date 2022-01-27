using System;


namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class UnlinkDocumentsCollectionCommand : BaseUnlinkCommand
    {
        public UnlinkDocumentsCollectionCommand(Guid noteId, Guid contentId, string email) : base(noteId, contentId, email)
        {
        }
    }
}
