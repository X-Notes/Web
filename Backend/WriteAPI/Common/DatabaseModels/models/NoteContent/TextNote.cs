using Common.DatabaseModels.models.NoteContent.ContentParts;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Common.DatabaseModels.models.NoteContent
{
    [Table("TextNote")]
    public class TextNote: BaseNoteContent
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
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Text;
        }

        public TextNote(TextNote text, Guid NoteId)
        {
            this.NoteId = NoteId;
            this.Order = text.Order;

            this.Content = text.Content;
            this.NoteTextTypeId = text.NoteTextTypeId;
            this.HTypeId = text.HTypeId;
            this.Checked = text.Checked;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Text;
        }

        public TextNote(Guid NoteId, NoteTextTypeENUM NoteTextTypeId, int Order, string Content = null)
        {
            this.NoteTextTypeId = NoteTextTypeId;
            this.NoteId = NoteId;
            this.Content = Content;
            this.Order = Order;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Text;
        }

        public TextNote(NoteTextTypeENUM NoteTextTypeId, string Content = null)
        {
            this.NoteTextTypeId = NoteTextTypeId;
            this.Content = Content;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Text;

        }
    }
}
