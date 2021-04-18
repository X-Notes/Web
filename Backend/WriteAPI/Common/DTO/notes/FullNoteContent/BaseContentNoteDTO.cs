using System;

namespace Common.DTO.notes.FullNoteContent
{
    public class BaseContentNoteDTO
    {
        public Guid Id { set; get; }
        public string Type { set; get; }
        public BaseContentNoteDTO(Guid Id, string Type)
        {
            this.Id = Id;
            this.Type = Type;
        }
    }
}
