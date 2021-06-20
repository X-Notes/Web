using Common.DatabaseModels.models.NoteContent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notes.FullNoteContent
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
