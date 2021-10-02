using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class TransformToDocumentsCollectionCommand : GeneralTransformToCommand<DocumentsCollectionNoteDTO>
    {
        public TransformToDocumentsCollectionCommand(Guid noteId, Guid contentId) : base(noteId, contentId)
        {
        }
    }
}
