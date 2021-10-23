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
            string content, 
            Guid id, 
            int order,
            NoteTextTypeENUM noteTextTypeId, 
            HTypeENUM? headingTypeId, 
            bool? @checked, 
            bool isBold, 
            bool isItalic, 
            DateTimeOffset updatedAt)
            :base(id, order, ContentTypeENUM.Text, updatedAt)
        {
            this.Content = content;
            this.HeadingTypeId = headingTypeId;
            this.NoteTextTypeId = noteTextTypeId;
            this.Checked = @checked;
            this.IsBold = isBold;
            this.IsItalic = isItalic;
        }
    }
}
