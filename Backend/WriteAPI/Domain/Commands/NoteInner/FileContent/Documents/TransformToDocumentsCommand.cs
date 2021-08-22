using Common.DTO.Notes.FullNoteContent;
using System;

namespace Domain.Commands.NoteInner.FileContent.Documents
{
    public class TransformToDocumentsCommand : GeneralTransformToCommand<DocumentNoteDTO>
    {
        public TransformToDocumentsCommand(Guid noteId, Guid contentId) : base(noteId, contentId)
        {
        }
    }
}
