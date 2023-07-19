

namespace Noots.Editor.Commands.Videos;

public class UpdateVideosCollectionInfoCommand : BaseUpdateCollectionInfo
{
    public UpdateVideosCollectionInfoCommand(Guid noteId, Guid contentId, string name, string connectionId) : base(noteId, contentId, name, connectionId)
    {
    }
}
