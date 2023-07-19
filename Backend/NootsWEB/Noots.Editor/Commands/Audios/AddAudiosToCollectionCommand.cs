

namespace Noots.Editor.Commands.Audios;

public class AddAudiosToCollectionCommand : BaseAddToCollectionItems
{
    public AddAudiosToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds, string connectionId) : base(noteId, contentId, fileIds, connectionId)
    {
    }
}
