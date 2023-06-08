

namespace Noots.Editor.Commands.Audios;

public class RemoveAudiosFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemoveAudiosFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
    {
    }
}
