using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class TextNoteDTO : BaseNoteContentDTO
    {
        [RequiredEnumFieldAttribute]
        public NoteTextTypeENUM NoteTextTypeId { set; get; }

        [Required]
        public bool IsBold { set; get; }

        [Required]
        public bool IsItalic { set; get; }

        public bool? Checked { set; get; }

        public HTypeENUM? HeadingTypeId { set; get; }

        public string Content { set; get; }

        public TextNoteDTO(
            string Content, 
            Guid Id, 
            int order,
            NoteTextTypeENUM NoteTextTypeId, 
            HTypeENUM? HeadingTypeId, 
            bool? Checked, 
            bool IsBold, 
            bool IsItalic, 
            DateTimeOffset UpdatedAt)
            :base(Id, order, ContentTypeENUM.Text, UpdatedAt)
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
