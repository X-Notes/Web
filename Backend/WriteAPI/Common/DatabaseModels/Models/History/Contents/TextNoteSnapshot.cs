using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.Interfaces.Note;
using System;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class TextNoteSnapshot : BaseNoteContentSnapshot, INoteText
    {
        public string Content { set; get; }

        public NoteTextTypeENUM NoteTextTypeId { set; get; }

        public HTypeENUM? HTypeId { set; get; }

        public bool? Checked { set; get; }

        public bool IsBold { set; get; }

        public bool IsItalic { set; get; }

        public TextNoteSnapshot
            (string content, NoteTextTypeENUM noteTextTypeId, HTypeENUM? hTypeId, bool? @checked, bool isBold, bool isItalic,
            int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Content = content;
            NoteTextTypeId = noteTextTypeId;
            HTypeId = hTypeId;
            Checked = @checked;
            IsBold = isBold;
            IsItalic = isItalic;    
        }
    }
}
