

namespace Noots.Editor.Commands.Videos;

public class AddVideosToCollectionCommand : BaseAddToCollectionItems
{
    public AddVideosToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds) : base(noteId, contentId, fileIds)
    {
    }
}
