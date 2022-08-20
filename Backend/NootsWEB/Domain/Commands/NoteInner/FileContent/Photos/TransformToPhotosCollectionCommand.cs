using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class TransformToPhotosCollectionCommand : GeneralTransformToCommand<PhotosCollectionNoteDTO>
    {
        public TransformToPhotosCollectionCommand(Guid noteId, Guid contentId)
            : base(noteId, contentId)
        {
        }
    }
}
