using Common.DatabaseModels.Models.NoteContent;
using Common.DTO.Notes.FullNoteContent.Files;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteContent
{
    public class DocumentsCollectionNoteDTO : BaseNoteContentDTO
    {
        public string Name { set; get; }
        public List<DocumentNoteDTO> Documents { set; get; }

        public DocumentsCollectionNoteDTO(Guid id, int order, DateTimeOffset updatedAt, string name, List<DocumentNoteDTO> documents, int version)
                : base(id, order, ContentTypeEnumDTO.Documents, updatedAt, version)
        {
            Name = name;
            Documents = documents;
        }
    }
}
