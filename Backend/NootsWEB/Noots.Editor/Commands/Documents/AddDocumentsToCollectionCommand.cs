

namespace Noots.Editor.Commands.Documents;

public class AddDocumentsToCollectionCommand : BaseAddToCollectionItems
{
    public AddDocumentsToCollectionCommand(Guid noteId, Guid contentId, List<Guid> fileIds) : base(noteId, contentId, fileIds)
    {
    }
}
