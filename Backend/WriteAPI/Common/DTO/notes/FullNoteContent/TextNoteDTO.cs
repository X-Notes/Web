using System;


namespace Common.DTO.notes.FullNoteContent
{
    public class TextNoteDTO : BaseContentNoteDTO
    {
        public string Content { set; get; }
        public TextNoteDTO(string Content, Guid Id, int Order, string Type)
            :base(Id, Order, Type)
        {
            this.Content = Content;
        }
    }
}
