using System;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class DocumentNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }
        public Guid FileId { set; get; }
        public string DocumentPath { set; get; }
        public DocumentNoteDTO(string Name, string DocumentPath, Guid fileId, Guid Id, DateTimeOffset UpdatedAt)
        : base(Id, ContentTypeENUM.Document, UpdatedAt)
        {
            this.FileId = fileId;
            this.Name = Name;
            this.DocumentPath = DocumentPath;
        }
    }
}
