using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.ContentParts;
using System;


namespace Common.DTO.notes.FullNoteContent
{
    public class TextNoteDTO : BaseContentNoteDTO
    {
        public string Content { set; get; }

        public HTypeENUM? HeadingTypeId { set; get; }

        public NoteTextTypeENUM NoteTextTypeId { set; get; }

        public bool? Checked { set; get; }

        public bool IsBold { set; get; }

        public bool IsItalic { set; get; }

        public TextNoteDTO(string Content, Guid Id, NoteTextTypeENUM NoteTextTypeId, 
            HTypeENUM? HeadingTypeId, bool? Checked, bool IsBold, bool IsItalic, DateTimeOffset UpdatedAt)
            :base(Id, ContentTypeENUM.Text, UpdatedAt)
        {
            this.Content = Content;
            this.HeadingTypeId = HeadingTypeId;
            this.NoteTextTypeId = NoteTextTypeId;
            this.Checked = Checked;
            this.IsBold = IsBold;
            this.IsItalic = IsItalic;
        }
    }
}
