using Common.DTO.Notes.FullNoteContent;

namespace Noots.Editor.Commands.Photos;

public class TransformToPhotosCollectionCommand : BaseTransformToCommand<PhotosCollectionNoteDTO>
{
    public TransformToPhotosCollectionCommand(Guid noteId, Guid contentId)
        : base(noteId, contentId)
    {
    }
}
