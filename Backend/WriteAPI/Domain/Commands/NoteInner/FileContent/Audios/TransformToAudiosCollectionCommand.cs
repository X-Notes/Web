using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class TransformToAudiosCollectionCommand : GeneralTransformToCommand<AudiosCollectionNoteDTO>
    {
        public TransformToAudiosCollectionCommand(Guid noteId, Guid contentId)
            : base(noteId, contentId)
        {
        }
    }
}
