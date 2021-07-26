using System;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class DocumentNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }

        public Guid FileId { set; get; }

        public string DocumentPath { set; get; }

        public Guid AuthorId { set; get; }

        public DocumentNoteDTO(string name, string documentPath, Guid fileId, Guid Id, DateTimeOffset updatedAt, Guid userId)
        : base(Id, ContentTypeENUM.Document, updatedAt)
        {
            FileId = fileId;
            Name = name;
            DocumentPath = documentPath;
            AuthorId = userId;
        }
    }
}
