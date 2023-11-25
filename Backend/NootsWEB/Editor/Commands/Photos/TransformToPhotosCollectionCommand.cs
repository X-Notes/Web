using Common.DTO.Notes.FullNoteContent;

namespace Editor.Commands.Photos;

public class TransformToPhotosCollectionCommand : BaseTransformToCommand<PhotosCollectionNoteDTO>
{
    public TransformToPhotosCollectionCommand(Guid noteId, Guid contentId, string connectionId)
        : base(noteId, contentId, connectionId)
    {
    }
}
