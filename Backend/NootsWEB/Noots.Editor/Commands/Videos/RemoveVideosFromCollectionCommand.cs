

namespace Noots.Editor.Commands.Videos;

public class RemoveVideosFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemoveVideosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
    {
    }
}
