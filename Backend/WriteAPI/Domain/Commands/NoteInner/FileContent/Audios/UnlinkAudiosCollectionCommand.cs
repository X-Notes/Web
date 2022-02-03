using System;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class UnlinkAudiosCollectionCommand : BaseUnlinkCommand
    {
        public UnlinkAudiosCollectionCommand(Guid noteId, Guid contentId, string email) : base(noteId, contentId, email)
        {
        }
    }
}
