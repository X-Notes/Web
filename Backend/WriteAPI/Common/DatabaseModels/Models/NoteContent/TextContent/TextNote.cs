using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.NoteContent.TextContent
{
    [Table(nameof(TextNote), Schema = SchemeConfig.Note)]
    public class TextNote : BaseNoteContent
    {
        public string Content { set; get; }

        public NoteTextTypeENUM NoteTextTypeId { set; get; }
        public NoteTextType NoteTextType { set; get; }

        public HTypeENUM? HTypeId { set; get; }
        public HType HType { set; get; }

        public bool? Checked { set; get; }

        public bool IsBold { set; get; }

        public bool IsItalic { set; get; }

        public TextNote()
        {
            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.Text;
        }


        public TextNote(TextNote text, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            Order = text.Order;

            Content = text.Content;
            NoteTextTypeId = text.NoteTextTypeId;
            HTypeId = text.HTypeId;
            Checked = text.Checked;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.Text;
        }

        public TextNote(bool isHistory, Guid entityId, NoteTextTypeENUM NoteTextTypeId, int Order, string Content = null)
        {
            SetId(isHistory, entityId);

            this.NoteTextTypeId = NoteTextTypeId;
            this.Content = Content;
            this.Order = Order;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.Text;
        }

        public TextNote(NoteTextTypeENUM NoteTextTypeId, string Content = null)
        {
            this.NoteTextTypeId = NoteTextTypeId;
            this.Content = Content;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.Text;

        }
    }
}
