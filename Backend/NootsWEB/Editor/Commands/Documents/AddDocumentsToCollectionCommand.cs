

namespace Editor.Commands.Documents;

public class AddDocumentsToCollectionCommand : BaseAddToCollectionItems
{
    public AddDocumentsToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds, string connectionId) : base(noteId, contentId, fileIds, connectionId)
    {
    }
}
