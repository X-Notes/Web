

namespace Noots.Editor.Commands.Documents;

public class RemoveDocumentsFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemoveDocumentsFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds) : base(noteId, contentId, itemIds)
    {
    }
}
