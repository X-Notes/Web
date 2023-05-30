

namespace Noots.Editor.Commands.Videos;

public class UpdateVideosCollectionInfoCommand : BaseUpdateCollectionInfo
{
    public UpdateVideosCollectionInfoCommand(Guid noteId, Guid contentId, string name) : base(noteId, contentId, name)
    {
    }
}
