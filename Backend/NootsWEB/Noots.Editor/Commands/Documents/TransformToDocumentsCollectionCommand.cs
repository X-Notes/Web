using Common.DTO.Notes.FullNoteContent;

namespace Noots.Editor.Commands.Documents;

public class TransformToDocumentsCollectionCommand : BaseTransformToCommand<DocumentsCollectionNoteDTO>
{
    public TransformToDocumentsCollectionCommand(Guid noteId, Guid contentId) : base(noteId, contentId)
    {
    }
}
