using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class TransformToVideosCommand : GeneralTransformToCommand<VideoNoteDTO>
    {
        public TransformToVideosCommand(Guid noteId, Guid contentId) : base(noteId, contentId)
        {
        }
    }
}
