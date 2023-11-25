using Common.DTO.Notes.FullNoteContent;

namespace Editor.Commands.Documents;

public class TransformToDocumentsCollectionCommand : BaseTransformToCommand<DocumentsCollectionNoteDTO>
{
    public TransformToDocumentsCollectionCommand(Guid noteId, Guid contentId, string connectionId) : base(noteId, contentId, connectionId)
    {
    }
}
