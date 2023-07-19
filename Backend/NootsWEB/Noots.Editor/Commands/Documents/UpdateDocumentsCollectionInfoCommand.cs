
namespace Noots.Editor.Commands.Documents;

public class UpdateDocumentsCollectionInfoCommand : BaseUpdateCollectionInfo
{
    public UpdateDocumentsCollectionInfoCommand(Guid noteId, Guid contentId, string name, string connectionId) : base(noteId, contentId, name, connectionId)
    {
    }
}
