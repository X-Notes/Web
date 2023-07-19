

namespace Noots.Editor.Commands.Audios;

public class RemoveAudiosFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemoveAudiosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds, string connectionId) : base(noteId, contentId, itemIds, connectionId)
    {
    }
}
