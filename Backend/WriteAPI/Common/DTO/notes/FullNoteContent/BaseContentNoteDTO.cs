using System;

namespace Common.DTO.notes.FullNoteContent
{
    public class BaseContentNoteDTO
    {
        public Guid Id { set; get; }
        public string Type { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public BaseContentNoteDTO(Guid Id, string Type, DateTimeOffset UpdatedAt)
        {
            this.Id = Id;
            this.Type = Type;
            this.UpdatedAt = UpdatedAt;
        }
    }
}
