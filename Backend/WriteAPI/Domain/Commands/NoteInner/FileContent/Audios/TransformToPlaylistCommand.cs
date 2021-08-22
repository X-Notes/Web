using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Audios
{
    public class TransformToPlaylistCommand : GeneralTransformToCommand<AudiosPlaylistNoteDTO>
    {
        public TransformToPlaylistCommand(Guid noteId, Guid contentId)
            : base(noteId, contentId)
        {
        }
    }
}
