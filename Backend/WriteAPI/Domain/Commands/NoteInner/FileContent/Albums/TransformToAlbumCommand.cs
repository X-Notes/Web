using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Albums
{
    public class TransformToAlbumCommand : GeneralTransformToCommand<AlbumNoteDTO>
    {
        public TransformToAlbumCommand(Guid noteId, Guid contentId)
            :base(noteId, contentId)
        {
        }
    }
}
