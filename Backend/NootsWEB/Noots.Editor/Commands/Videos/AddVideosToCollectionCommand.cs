

namespace Noots.Editor.Commands.Videos;

public class AddVideosToCollectionCommand : BaseAddToCollectionItems
{
    public AddVideosToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds, string connectionId) : base(noteId, contentId, fileIds, connectionId)
    {
    }
}
