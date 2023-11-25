

namespace Editor.Commands.Documents;

public class RemoveDocumentsFromCollectionCommand : BaseRemoveFromCollectionItems
{
    public RemoveDocumentsFromCollectionCommand(Guid noteId, Guid contentId, List<Guid> itemIds, string connectionId) : base(noteId, contentId, itemIds, connectionId)
    {
    }
}
