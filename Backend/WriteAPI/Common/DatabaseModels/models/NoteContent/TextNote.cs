using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Common.DatabaseModels.models.NoteContent
{
    [Table("TextNote")]
    public class TextNote: BaseNoteContent
    {
        public string Content { set; get; }
        [Required]
        public string TextType { set; get; }
        public string HeadingType { set; get; }
        public bool Checked { set; get; }

        public TextNote()
        {

        }

        public TextNote(Guid NoteId, string TextType, int Order, string Content = null)
        {
            this.TextType = TextType;
            this.NoteId = NoteId;
            this.Content = Content;
            this.Order = Order;
            this.UpdatedAt = DateTimeOffset.Now;
        }

        public TextNote(string TextType, string Content = null)
        {
            this.TextType = TextType;
            this.Content = Content;

        }
    }
}
