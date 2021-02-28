using System;

namespace Common.DTO.notes.FullNoteContent
{
    public class BaseContentNoteDTO
    {
        public Guid Id { set; get; }
        public int Order { set; get; }
        public string Type { set; get; }
        public BaseContentNoteDTO(Guid Id, int Order, string Type)
        {
            this.Id = Id;
            this.Order = Order;
            this.Type = Type;
        }
    }
}
