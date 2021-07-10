using System;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class BaseContentNoteDTO
    {
        public Guid Id { set; get; }
        public ContentTypeENUM TypeId { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public BaseContentNoteDTO(Guid Id, ContentTypeENUM typeId, DateTimeOffset UpdatedAt)
        {
            this.Id = Id;
            this.TypeId = typeId;
            this.UpdatedAt = UpdatedAt;
        }
    }
}
