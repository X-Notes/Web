using System;


namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class UpdateAudiosCollectionInfoCommand : BaseUpdateCollectionInfo
    {
        public UpdateAudiosCollectionInfoCommand(Guid noteId, Guid contentId, string name) : base(noteId, contentId, name)
        {
        }
    }
}
