using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;

namespace Common.DTO.Notes.FullNoteContent
{
    public class TextNoteDTO : BaseNoteContentDTO
    {
        [RequiredEnumFieldAttribute]
        public NoteTextTypeENUM NoteTextTypeId { set; get; }

        public bool? Checked { set; get; }

        public HTypeENUM? HeadingTypeId { set; get; }

        public string Contents { set; get; }

        public int ListId { set; get; }

        public TextNoteDTO(
            string contents, 
            Guid id, 
            int order,
            NoteTextTypeENUM noteTextTypeId, 
            HTypeENUM? headingTypeId, 
            bool? @checked,
            int listId,
            DateTimeOffset updatedAt)
            :base(id, order, ContentTypeEnumDTO.Text, updatedAt)
        {
            this.Contents = contents;
            this.HeadingTypeId = headingTypeId;
            this.NoteTextTypeId = noteTextTypeId;
            this.Checked = @checked;
            this.ListId = listId;
        }
    }
}
