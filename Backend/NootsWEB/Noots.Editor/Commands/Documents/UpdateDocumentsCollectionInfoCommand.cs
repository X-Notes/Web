
namespace Noots.Editor.Commands.Documents;

public class UpdateDocumentsCollectionInfoCommand : BaseUpdateCollectionInfo
{
    public UpdateDocumentsCollectionInfoCommand(Guid noteId, Guid contentId, string name) : base(noteId, contentId, name)
    {
    }
}
