using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Videos
{
    public class TransformToVideosCollectionCommand : GeneralTransformToCommand<VideosCollectionNoteDTO>
    {
        public TransformToVideosCollectionCommand(Guid noteId, Guid contentId) : base(noteId, contentId)
        {
        }
    }
}
