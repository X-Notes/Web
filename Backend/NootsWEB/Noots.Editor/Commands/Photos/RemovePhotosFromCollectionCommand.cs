

namespace Editor.Commands.Photos;

public class RemovePhotosFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemovePhotosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds, string connectionId) : base(noteId, contentId, itemIds, connectionId)
    {
    }
}
