using System;


namespace Common.DTO.notes.FullNoteContent
{
    public class TextNoteDTO : BaseContentNoteDTO
    {
        public string Content { set; get; }
        public string HeadingType { set; get; }
        public bool Checked { set; get; }
        public TextNoteDTO(string Content, Guid Id, string Type, string HeadingType, bool Checked, Guid? NextId, Guid? PrevId)
            :base(Id, Type, NextId, PrevId)
        {
            this.Content = Content;
            this.HeadingType = HeadingType;
            this.Checked = Checked;
        }
    }
}
