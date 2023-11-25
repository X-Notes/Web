

namespace Editor.Commands.Videos;

public class RemoveVideosFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemoveVideosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds, string connectionId) : base(noteId, contentId, itemIds, connectionId)
    {
    }
}
