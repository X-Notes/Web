using Common.DatabaseModels.Models.NoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteContent
{
    public class DocumentsCollectionNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }
        public List<DocumentNoteDTO> Documents { set; get; }

        public DocumentsCollectionNoteDTO(Guid id, DateTimeOffset updatedAt, string name, List<DocumentNoteDTO> documents)
                : base(id, ContentTypeENUM.DocumentsCollection, updatedAt)
        {
            Name = name;
            Documents = documents;
        }
    }
}
