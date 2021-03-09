using System;

namespace Common.DTO.notes.FullNoteContent
{
    public class BaseContentNoteDTO
    {
        public Guid Id { set; get; }
        public Guid? NextId { get; set; }
        public Guid? PrevId { get; set; }
        public string Type { set; get; }
        public BaseContentNoteDTO(Guid Id, string Type, Guid? NextId, Guid? PrevId)
        {
            this.Id = Id;
            this.Type = Type;
            this.NextId = NextId;
            this.PrevId = PrevId;
        }
    }
}
