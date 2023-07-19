

namespace Noots.Editor.Commands.Photos;

public class AddPhotosToCollectionCommand : BaseAddToCollectionItems
{
    public AddPhotosToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds, string connectionId) : base(noteId, contentId, fileIds, connectionId)
    {
    }
}
