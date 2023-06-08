

namespace Noots.Editor.Commands.Photos;

public class RemovePhotosFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemovePhotosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
    {
    }
}
